"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface LivePosition {
  lat: number
  lng: number
  accuracy?: number
}

/**
 * Acompanha a posição ao vivo de uma entrega.
 *
 * 1. Busca a última posição conhecida no banco (a loja tem acesso via RLS),
 *    para o mapa não ficar vazio até chegar o próximo broadcast.
 * 2. Assina o canal Realtime `rastreio:{deliveryId}` para receber as
 *    posições enviadas pelo entregador em tempo real.
 *
 * Use apenas em contextos autenticados (dashboard), pois a busca inicial
 * depende das policies de RLS da loja.
 */
export function useDeliveryLocation(
  deliveryId: string,
  enabled: boolean
): LivePosition | null {
  const [position, setPosition] = useState<LivePosition | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    let cancelado = false
    let channel: ReturnType<typeof supabase.channel> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let tentativa = 0

    // Última posição conhecida no banco
    supabase
      .from("delivery_locations")
      .select("lat, lng, accuracy")
      .eq("delivery_id", deliveryId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelado && data) {
          setPosition({ lat: data.lat, lng: data.lng, accuracy: data.accuracy ?? undefined })
        }
      })

    const limparTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    const limparCanal = () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }

    const agendarReconexao = () => {
      if (cancelado) return
      limparTimer()
      const delay = Math.min(1000 * 2 ** tentativa, 10000)
      tentativa += 1
      reconnectTimer = setTimeout(() => {
        if (!cancelado) subscribe()
      }, delay)
    }

    // Posições ao vivo via broadcast, com reconexão silenciosa
    const subscribe = () => {
      if (cancelado) return
      limparTimer()
      limparCanal()

      channel = supabase
        .channel(`rastreio:${deliveryId}`)
        .on("broadcast", { event: "location" }, (payload) => {
          const { lat, lng, accuracy } = payload.payload as LivePosition
          if (!cancelado) setPosition({ lat, lng, accuracy })
        })
        .subscribe((status) => {
          if (cancelado) return
          if (status === "SUBSCRIBED") {
            tentativa = 0
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            agendarReconexao()
          }
        })
    }

    const handleOnline = () => {
      if (cancelado) return
      tentativa = 0
      subscribe()
    }

    window.addEventListener("online", handleOnline)
    subscribe()

    return () => {
      cancelado = true
      window.removeEventListener("online", handleOnline)
      limparTimer()
      limparCanal()
    }
  }, [deliveryId, enabled])

  return position
}
