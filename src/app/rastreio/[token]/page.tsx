"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin, Clock, CheckCircle, Loader2, AlertCircle, WifiOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { statusLabel, tempoDecorrido } from "@/lib/utils"
import type { DeliveryStatus } from "@/types/database"

const DeliveryMap = dynamic(() => import("@/components/map/DeliveryMap"), { ssr: false })

interface Posicao {
  lat: number
  lng: number
}

interface EntregaInfo {
  id: string
  customer_name: string
  customer_address: string
  status: DeliveryStatus
  store_name: string
  dispatched_at: string | null
  created_at: string
}

type EstadoPagina = "carregando" | "erro" | "aguardando" | "acompanhando" | "entregue"

export default function RastreioPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoPagina>("carregando")
  const [entrega, setEntrega] = useState<EntregaInfo | null>(null)
  const [posicao, setPosicao] = useState<Posicao | null>(null)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [conectado, setConectado] = useState(true)
  const [online, setOnline] = useState(true)

  // estado atual acessível dentro dos callbacks do canal sem recriar a assinatura
  const estadoRef = useRef<EstadoPagina>(estado)
  useEffect(() => { estadoRef.current = estado }, [estado])

  useEffect(() => {
    params.then((p) => setToken(p.token))
  }, [params])

  useEffect(() => {
    if (!token) return

    fetch(`/api/tracking/${token}?tipo=customer`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErroMsg(data.error)
          setEstado("erro")
          return
        }

        setEntrega(data)

        if (data.status === "delivered") {
          setEstado("entregue")
        } else if (data.status === "pending") {
          setEstado("aguardando")
        } else {
          setEstado("acompanhando")
        }
      })
      .catch(() => {
        setErroMsg("Não foi possível carregar o rastreamento.")
        setEstado("erro")
      })
  }, [token])

  // Realtime — escuta broadcast do canal de entrega, com reconexão resiliente
  const deliveryId = entrega?.id ?? null
  useEffect(() => {
    if (!deliveryId) return
    const supabase = createClient()

    let channel: ReturnType<typeof supabase.channel> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let tentativa = 0
    let cancelado = false

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

    const subscribe = () => {
      if (cancelado) return
      limparTimer()
      limparCanal()

      channel = supabase
        .channel(`rastreio:${deliveryId}`)
        .on("broadcast", { event: "location" }, (payload) => {
          const { lat, lng } = payload.payload as { lat: number; lng: number }
          setPosicao({ lat, lng })
          if (estadoRef.current === "aguardando") setEstado("acompanhando")
        })
        .on("broadcast", { event: "status" }, (payload) => {
          const { status } = payload.payload as { status: DeliveryStatus }
          setEntrega((prev) => prev ? { ...prev, status } : prev)
          if (status === "delivered") setEstado("entregue")
        })
        .subscribe((status) => {
          if (cancelado) return
          if (status === "SUBSCRIBED") {
            tentativa = 0
            setConectado(true)
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setConectado(false)
            agendarReconexao()
          }
        })
    }

    const handleOnline = () => {
      setOnline(true)
      tentativa = 0
      subscribe()
    }

    const handleOffline = () => {
      setOnline(false)
      setConectado(false)
    }

    setOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    subscribe()

    return () => {
      cancelado = true
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      limparTimer()
      limparCanal()
    }
  }, [deliveryId])

  if (estado === "carregando") {
    return (
      <Tela>
        <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
        <p className="text-neutral-500 mt-4">Carregando rastreamento...</p>
      </Tela>
    )
  }

  if (estado === "erro") {
    return (
      <Tela>
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-center">Link inválido</h2>
        <p className="text-neutral-500 text-center mt-2 max-w-xs">{erroMsg}</p>
      </Tela>
    )
  }

  if (estado === "entregue") {
    return (
      <Tela>
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Pedido entregue!</h2>
        <p className="text-neutral-500 text-center mt-2">
          Seu pedido foi entregue com sucesso.
        </p>
        {entrega && (
          <p className="text-xs text-neutral-400 mt-1">{entrega.store_name}</p>
        )}
      </Tela>
    )
  }

  if (estado === "aguardando") {
    return (
      <Tela>
        <div className="bg-yellow-100 rounded-full p-4 mb-4">
          <Clock className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 text-center">Aguardando despacho</h2>
        <p className="text-neutral-500 text-center mt-2 max-w-xs">
          Seu pedido ainda está sendo preparado. O rastreamento começará quando o entregador sair.
        </p>
        {entrega && (
          <div className="mt-6 bg-neutral-50 border rounded-xl p-4 w-full max-w-xs">
            <p className="text-xs text-neutral-400">Loja</p>
            <p className="font-semibold">{entrega.store_name}</p>
            <p className="text-xs text-neutral-400 mt-2">Criado</p>
            <p className="text-sm">{tempoDecorrido(entrega.created_at)}</p>
          </div>
        )}
      </Tela>
    )
  }

  // acompanhando
  return (
    <div className="h-screen flex flex-col">
      {/* Mapa em tela cheia */}
      <div className="flex-1 relative">
        <DeliveryMap position={posicao} className="h-full w-full" />

        {!posicao && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Aguardando posição do entregador...</p>
            </div>
          </div>
        )}
      </div>

      {/* Card inferior */}
      {entrega && (
        <div className="bg-white border-t border-neutral-200 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 rounded-lg p-1">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-sm">Rastreaí</span>
            </div>
            <div className="flex items-center gap-2">
              {posicao && conectado && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  ao vivo
                </span>
              )}
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {statusLabel(entrega.status)}
              </span>
            </div>
          </div>

          <p className="text-sm font-medium text-neutral-800">{entrega.store_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {entrega.customer_address}
          </p>

          {entrega.dispatched_at && (
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Saiu {tempoDecorrido(entrega.dispatched_at)}
            </p>
          )}

          {(!online || !conectado) && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
              {!online ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  Sem conexão — tentando reconectar
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reconectando…
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Tela({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
      {children}
    </div>
  )
}
