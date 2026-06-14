import { createAdminClient } from "@/lib/supabase/admin"
import { gerarToken } from "@/lib/tokens"
import { getOrder } from "./client"
import { DELIVERY_MODE_MERCHANT, type IfoodOrder } from "./types"

/** Resultado do processamento de um pedido iFood. */
export type ProcessOrderResult =
  | { status: "criada"; deliveryId: string }
  | { status: "ignorada"; motivo: string }

/** Extrai o endereço de entrega do pedido em texto. */
function extrairEndereco(order: IfoodOrder): string {
  const addr = order.delivery?.deliveryAddress
  if (!addr) return "Endereço não informado"
  if (addr.formattedAddress) return addr.formattedAddress

  const partes = [
    addr.streetName && addr.streetNumber
      ? `${addr.streetName}, ${addr.streetNumber}`
      : addr.streetName,
    addr.neighborhood,
    addr.city,
  ].filter(Boolean)

  return partes.length > 0 ? partes.join(" - ") : "Endereço não informado"
}

/**
 * Verifica se um pedido é de entrega própria da loja (MERCHANT).
 * TODO: confirmar o campo correto na doc viva — pode ser `delivery.mode`
 * ou outro indicador dependendo da versão da API.
 */
function isEntregaPropria(order: IfoodOrder): boolean {
  return order.delivery?.mode === DELIVERY_MODE_MERCHANT
}

/**
 * Processa um pedido do iFood: busca os detalhes, valida que é entrega própria,
 * encontra a loja correspondente e cria a entrega (evitando duplicatas).
 *
 * Usado tanto pelo polling quanto pelo webhook. Idempotente por `ifood_order_id`.
 */
export async function processarPedidoIfood(
  orderId: string,
  merchantIdDoEvento?: string
): Promise<ProcessOrderResult> {
  const admin = createAdminClient()

  // Idempotência: se já existe entrega para esse pedido, não recria.
  const { data: existente } = await admin
    .from("deliveries")
    .select("id")
    .eq("ifood_order_id", orderId)
    .maybeSingle()

  if (existente) {
    return { status: "ignorada", motivo: "entrega já existe para este pedido" }
  }

  const order = await getOrder(orderId)

  if (!isEntregaPropria(order)) {
    return { status: "ignorada", motivo: "pedido não é de entrega própria (MERCHANT)" }
  }

  const merchantId = order.merchantId ?? merchantIdDoEvento
  if (!merchantId) {
    return { status: "ignorada", motivo: "pedido sem merchantId" }
  }

  const { data: store } = await admin
    .from("stores")
    .select("id")
    .eq("ifood_merchant_id", merchantId)
    .maybeSingle()

  if (!store) {
    return { status: "ignorada", motivo: "nenhuma loja cadastrada com este merchantId" }
  }

  const { data: delivery, error } = await admin
    .from("deliveries")
    .insert({
      store_id: store.id,
      ifood_order_id: orderId,
      customer_name: order.customer?.name ?? "Cliente iFood",
      customer_address: extrairEndereco(order),
      courier_token: gerarToken(),
      customer_token: gerarToken(),
    })
    .select("id")
    .single()

  if (error || !delivery) {
    throw new Error(`Falha ao criar entrega para o pedido ${orderId}: ${error?.message}`)
  }

  return { status: "criada", deliveryId: delivery.id }
}
