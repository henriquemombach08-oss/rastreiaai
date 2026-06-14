import { NextRequest, NextResponse } from "next/server"
import { validarAssinaturaWebhook } from "@/lib/ifood/webhook"
import { processarPedidoIfood } from "@/lib/ifood/orders"
import { IFOOD_EVENT } from "@/lib/ifood/types"

export const dynamic = "force-dynamic"

/**
 * Endpoint de webhook do iFood (alternativa ao polling).
 *
 * Recebe eventos de pedido, valida a assinatura e processa os pedidos de
 * entrega própria. Desativado no MVP — habilitar com IFOOD_ENABLED=true.
 *
 * O iFood espera HTTP 2xx para confirmar o recebimento; respondemos rápido e
 * deixamos a criação da entrega (idempotente) seguir o caminho compartilhado
 * com o polling.
 */
export async function POST(req: NextRequest) {
  if (process.env.IFOOD_ENABLED !== "true") {
    return NextResponse.json({ error: "Integração iFood não habilitada" }, { status: 503 })
  }

  const secret = process.env.IFOOD_WEBHOOK_SECRET
  const assinatura = req.headers.get("x-ifood-signature")

  if (!secret || !assinatura) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 401 })
  }

  // Lê o corpo bruto ANTES de parsear — a assinatura é sobre os bytes originais.
  const rawBody = await req.text()

  if (!validarAssinaturaWebhook(rawBody, assinatura, secret)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  let evento: { fullCode?: string; code?: string; orderId?: string; merchantId?: string }
  try {
    evento = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const codigo = evento.fullCode ?? evento.code
  if (codigo === IFOOD_EVENT.PLACED && evento.orderId) {
    try {
      await processarPedidoIfood(evento.orderId, evento.merchantId)
    } catch {
      // Erro no processamento não deve impedir o ack ao iFood; o polling
      // (se ativo) ou um reenvio do webhook tenta novamente depois.
    }
  }

  return NextResponse.json({ received: true })
}
