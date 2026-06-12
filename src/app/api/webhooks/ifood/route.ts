import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { gerarToken } from "@/lib/tokens"

// Integração iFood desativada no MVP — habilitar com IFOOD_ENABLED=true
export async function POST(req: NextRequest) {
  if (process.env.IFOOD_ENABLED !== "true") {
    return NextResponse.json({ error: "Integração iFood não habilitada" }, { status: 503 })
  }

  // Valida assinatura do webhook
  const assinatura = req.headers.get("x-ifood-signature")
  const secret = process.env.IFOOD_WEBHOOK_SECRET

  if (!assinatura || !secret) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  const body = await req.text()

  // TODO: validar HMAC-SHA256 da assinatura iFood quando a documentação estiver disponível
  // const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex")
  // if (hmac !== assinatura) return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })

  let evento: { eventType?: string; orderId?: string; merchantId?: string; order?: { deliveryMethod?: string; customer?: { name?: string }; deliveryAddress?: { formattedAddress?: string } } }
  try {
    evento = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  // Processa apenas pedidos com entrega própria (MERCHANT)
  if (
    evento.eventType === "PLACED" &&
    evento.order?.deliveryMethod === "MERCHANT"
  ) {
    const admin = createAdminClient()

    const { data: store } = await admin
      .from("stores")
      .select("id")
      .eq("ifood_merchant_id", evento.merchantId ?? "")
      .single()

    if (store) {
      await admin.from("deliveries").insert({
        store_id: store.id,
        ifood_order_id: evento.orderId ?? null,
        customer_name: evento.order?.customer?.name ?? "Cliente iFood",
        customer_address: evento.order?.deliveryAddress?.formattedAddress ?? "Endereço não informado",
        courier_token: gerarToken(),
        customer_token: gerarToken(),
      })
    }
  }

  // iFood exige 200 para confirmar recebimento (acknowledgment)
  return NextResponse.json({ received: true })
}
