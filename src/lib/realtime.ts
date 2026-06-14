"use client"

import type { RealtimeChannel } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { LivePosition } from "@/lib/hooks/useDeliveryLocation"

/**
 * Cria e assina o canal Realtime usado pelo entregador para transmitir
 * sua localização ao vivo.
 *
 * Contrato compartilhado com os assinantes:
 * - canal: `rastreio:${deliveryId}` (UUID da entrega, NÃO o token)
 * - evento: "location", payload { lat, lng, accuracy? }
 *
 * `broadcast.self` fica desligado pois o próprio entregador não precisa
 * receber as posições que ele mesmo envia.
 *
 * @param onSubscribed chamado quando o canal entra em estado SUBSCRIBED
 *                     (somente após isso é seguro fazer broadcast).
 */
export function criarCanalEntregador(
  deliveryId: string,
  onSubscribed: () => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase.channel(`rastreio:${deliveryId}`, {
    config: { broadcast: { self: false } },
  })

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      onSubscribed()
    }
  })

  return channel
}

/** Transmite uma posição ao vivo pelo canal já assinado. */
export function transmitirPosicao(
  channel: RealtimeChannel,
  posicao: LivePosition
): void {
  void channel.send({
    type: "broadcast",
    event: "location",
    payload: posicao,
  })
}
