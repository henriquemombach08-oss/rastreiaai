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

    // Posições ao vivo via broadcast
    const channel = supabase
      .channel(`rastreio:${deliveryId}`)
      .on("broadcast", { event: "location" }, (payload) => {
        const { lat, lng, accuracy } = payload.payload as LivePosition
        if (!cancelado) setPosition({ lat, lng, accuracy })
      })
      .subscribe()

    return () => {
      cancelado = true
      supabase.removeChannel(channel)
    }
  }, [deliveryId, enabled])

  return position
}
