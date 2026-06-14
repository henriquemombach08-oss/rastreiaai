"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { MapPin, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { criarCanalEntregador, transmitirPosicao } from "@/lib/realtime"

type EstadoPagina = "carregando" | "erro" | "aguardando" | "rastreando" | "concluido"

interface EntregaInfo {
  id: string
  customer_name: string
  customer_address: string
  status: string
}

export default function EntregadorPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoPagina>("carregando")
  const [entrega, setEntrega] = useState<EntregaInfo | null>(null)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const [precisao, setPrecisao] = useState<number | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const filaOfflineRef = useRef<Array<{ lat: number; lng: number; accuracy?: number }>>([])
  const ultimoPersistidoRef = useRef<number>(0)
  const ultimoBroadcastRef = useRef<number>(0)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const canalProntoRef = useRef<boolean>(false)

  // Resolve params (Next.js 15 — params é Promise)
  useEffect(() => {
    params.then((p) => setToken(p.token))
  }, [params])

  // Carrega entrega ao obter token
  useEffect(() => {
    if (!token) return

    fetch(`/api/tracking/${token}?tipo=courier`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErroMsg(data.error)
          setEstado("erro")
          return
        }
        if (data.status === "delivered" || data.status === "canceled") {
          setEstado("concluido")
          return
        }
        setEntrega(data)
        setEstado("aguardando")
      })
      .catch(() => {
        setErroMsg("Não foi possível carregar os dados da entrega.")
        setEstado("erro")
      })
  }, [token])

  // Monitora conexão
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      enviarFilaOffline()
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Limpeza ao desmontar: watch, wake lock e canal Realtime.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      wakeLockRef.current?.release()
      wakeLockRef.current = null
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        canalProntoRef.current = false
      }
    }
  }, [])

  const enviarFilaOffline = useCallback(async () => {
    if (!token || filaOfflineRef.current.length === 0) return
    const fila = [...filaOfflineRef.current]
    filaOfflineRef.current = []

    for (const loc of fila) {
      try {
        await fetch(`/api/deliveries/location?token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loc),
        })
      } catch {
        filaOfflineRef.current.push(loc)
      }
    }
  }, [token])

  const enviarPosicao = useCallback(
    async (lat: number, lng: number, accuracy?: number) => {
      const agora = Date.now()
      const payload = { lat, lng, accuracy }

      // Broadcast direto do navegador a cada ~5s (somente em tempo-real,
      // exige canal já SUBSCRIBED e conexão ativa — não enfileira posição velha).
      if (
        navigator.onLine &&
        channelRef.current &&
        canalProntoRef.current &&
        agora - ultimoBroadcastRef.current >= 5000
      ) {
        ultimoBroadcastRef.current = agora
        transmitirPosicao(channelRef.current, payload)
      }

      // Persiste no banco a cada ~15s (usa fila offline para reenvio).
      if (!navigator.onLine) {
        filaOfflineRef.current.push(payload)
        return
      }

      const devePersistir = agora - ultimoPersistidoRef.current >= 15000
      if (devePersistir) {
        ultimoPersistidoRef.current = agora
        try {
          await fetch(`/api/deliveries/location?token=${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        } catch {
          filaOfflineRef.current.push(payload)
        }
      }
    },
    [token]
  )

  const iniciarRastreamento = useCallback(async () => {
    if (!navigator.geolocation) {
      setErroMsg("Seu navegador não suporta geolocalização.")
      setEstado("erro")
      return
    }

    // Assina o canal Realtime para broadcast direto do navegador.
    if (entrega && !channelRef.current) {
      canalProntoRef.current = false
      channelRef.current = criarCanalEntregador(entrega.id, () => {
        canalProntoRef.current = true
      })
    }

    // Wake Lock — mantém tela acesa
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      }
    } catch {
      // Wake Lock não crítico — continua sem ele
    }

    setEstado("rastreando")

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPrecisao(Math.round(pos.coords.accuracy))
        enviarPosicao(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setErroMsg("Permissão de localização negada. Habilite o GPS nas configurações do navegador.")
          setEstado("erro")
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }, [enviarPosicao, entrega])

  async function concluirEntrega() {
    if (!token) return

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    wakeLockRef.current?.release()
    wakeLockRef.current = null

    if (channelRef.current) {
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      canalProntoRef.current = false
    }

    try {
      await fetch(`/api/deliveries/location?token=${token}&concluir=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    } catch { /* ignora */ }

    setEstado("concluido")
  }

  // Estado: carregando
  if (estado === "carregando") {
    return (
      <Tela>
        <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
        <p className="text-neutral-500 mt-4">Carregando entrega...</p>
      </Tela>
    )
  }

  // Estado: erro
  if (estado === "erro") {
    return (
      <Tela>
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-800 text-center">Ops!</h2>
        <p className="text-neutral-500 text-center mt-2 max-w-xs">{erroMsg}</p>
      </Tela>
    )
  }

  // Estado: concluído
  if (estado === "concluido") {
    return (
      <Tela>
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Entrega concluída!</h2>
        <p className="text-neutral-500 text-center mt-2">Obrigado pelo seu trabalho.</p>
      </Tela>
    )
  }

  // Estado: aguardando início
  if (estado === "aguardando") {
    return (
      <Tela>
        <div className="bg-brand rounded-2xl p-5 mb-6">
          <MapPin className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-xl font-black text-neutral-800 text-center mb-1">Rastreaí</h2>
        <p className="text-neutral-500 text-sm text-center mb-6">Entregador</p>

        {entrega && (
          <div className="bg-neutral-50 border rounded-xl p-4 mb-8 w-full max-w-xs space-y-2">
            <div>
              <p className="text-xs text-neutral-400">Cliente</p>
              <p className="font-semibold">{entrega.customer_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Endereço</p>
              <p className="text-sm text-neutral-700">{entrega.customer_address}</p>
            </div>
          </div>
        )}

        <Button size="xl" className="w-full max-w-xs" onClick={iniciarRastreamento}>
          <MapPin className="h-5 w-5" />
          Iniciar entrega
        </Button>
        <p className="text-xs text-neutral-400 mt-4 text-center">
          O app vai pedir permissão para acessar sua localização
        </p>
      </Tela>
    )
  }

  // Estado: rastreando
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-between p-6 text-white">
      <div className="w-full flex items-center justify-between mt-4">
        <span className="font-bold text-lg">Rastreaí</span>
        <div className={`flex items-center gap-1.5 text-sm ${online ? "text-green-400" : "text-red-400"}`}>
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {online ? "Conectado" : "Offline"}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <div className="h-16 w-16 rounded-full bg-green-500/40 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
        <p className="text-green-400 font-semibold text-lg">Rastreando</p>
        {precisao !== null && (
          <p className="text-neutral-400 text-sm">Precisão: ±{precisao}m</p>
        )}
        {!online && filaOfflineRef.current.length > 0 && (
          <p className="text-yellow-400 text-xs">
            {filaOfflineRef.current.length} pos. aguardando conexão
          </p>
        )}
      </div>

      <div className="w-full space-y-4">
        {entrega && (
          <div className="bg-white/10 rounded-xl p-4 text-sm">
            <p className="text-neutral-300">{entrega.customer_name}</p>
            <p className="text-neutral-400 text-xs mt-1">{entrega.customer_address}</p>
          </div>
        )}
        <Button
          size="xl"
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={concluirEntrega}
        >
          <CheckCircle className="h-5 w-5" />
          Marcar como entregue
        </Button>
      </div>
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
