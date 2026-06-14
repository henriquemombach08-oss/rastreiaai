import { NextRequest, NextResponse } from "next/server"
import { pollEvents, acknowledgeEvents } from "@/lib/ifood/client"
import { processarPedidoIfood } from "@/lib/ifood/orders"
import { IFOOD_EVENT, type IfoodAcknowledgment } from "@/lib/ifood/types"

// Polling não pode ser cacheado.
export const dynamic = "force-dynamic"

/**
 * Consulta a fila de eventos do iFood e processa os pedidos de entrega própria.
 *
 * Pensado para ser chamado por um agendador (cron) a cada ~30s. Protegido por
 * um segredo no header Authorization (Bearer CRON_SECRET) e pela flag
 * IFOOD_ENABLED. O iFood exige acknowledgment de TODOS os eventos consumidos —
 * por isso confirmamos todos no fim, mesmo os que ignoramos, para não receber
 * o mesmo evento repetidamente.
 */
export async function POST(req: NextRequest) {
  if (process.env.IFOOD_ENABLED !== "true") {
    return NextResponse.json({ error: "Integração iFood não habilitada" }, { status: 503 })
  }

  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let eventos
  try {
    eventos = await pollEvents()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  let criadas = 0
  let ignoradas = 0
  const aConfirmar: IfoodAcknowledgment[] = []

  for (const evento of eventos) {
    // Sempre confirma o evento para não reprocessar (a criação é idempotente).
    aConfirmar.push({ id: evento.id })

    const codigo = evento.fullCode ?? evento.code
    if (codigo !== IFOOD_EVENT.PLACED) {
      ignoradas++
      continue
    }

    try {
      const r = await processarPedidoIfood(evento.orderId, evento.merchantId)
      if (r.status === "criada") criadas++
      else ignoradas++
    } catch {
      // Não confirma este evento se o processamento falhou: deixa para a
      // próxima rodada de polling tentar de novo.
      const idx = aConfirmar.findIndex((a) => a.id === evento.id)
      if (idx >= 0) aConfirmar.splice(idx, 1)
      ignoradas++
    }
  }

  try {
    await acknowledgeEvents(aConfirmar)
  } catch {
    // Acknowledgment falho: o iFood reentrega os eventos no próximo polling.
  }

  return NextResponse.json({
    recebidos: eventos.length,
    criadas,
    ignoradas,
    confirmados: aConfirmar.length,
  })
}
