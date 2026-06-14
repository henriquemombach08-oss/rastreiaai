"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Package, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeliveryCard } from "@/components/dashboard/DeliveryCard"
import { NewDeliveryForm } from "@/components/dashboard/NewDeliveryForm"
import { createClient } from "@/lib/supabase/client"
import type { Store, Delivery } from "@/types/database"

interface DashboardClientProps {
  store: Store
  initialDeliveries: Delivery[]
}

export function DashboardClient({ store, initialDeliveries }: DashboardClientProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)
  const [showForm, setShowForm] = useState(false)
  const [aba, setAba] = useState<"ativas" | "historico">("ativas")
  const supabase = createClient()

  const recarregar = useCallback(async () => {
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (data) setDeliveries(data)
  }, [supabase, store.id])

  // Realtime: atualiza quando status de entrega muda, com reconexão resiliente
  useEffect(() => {
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
        .channel(`dashboard:${store.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "deliveries",
            filter: `store_id=eq.${store.id}`,
          },
          () => recarregar()
        )
        .subscribe((status) => {
          if (cancelado) return
          if (status === "SUBSCRIBED") {
            tentativa = 0
            // sincroniza após reconectar, caso eventos tenham sido perdidos
            recarregar()
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
  }, [supabase, store.id, recarregar])

  async function handleDispatch(id: string) {
    await fetch(`/api/deliveries/${id}/dispatch`, { method: "POST" })
    await recarregar()
  }

  async function handleComplete(id: string) {
    await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    })
    await recarregar()
  }

  const ativas = deliveries.filter(
    (d) => d.status === "pending" || d.status === "dispatched" || d.status === "nearby"
  )
  const historico = deliveries.filter(
    (d) => d.status === "delivered" || d.status === "canceled"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{store.name}</h1>
          <p className="text-sm text-neutral-500">{ativas.length} entrega{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Nova entrega
        </Button>
      </div>

      {/* Formulário nova entrega */}
      {showForm && (
        <NewDeliveryForm
          storeId={store.id}
          onSuccess={() => { setShowForm(false); recarregar() }}
        />
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setAba("ativas")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            aba === "ativas" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Package className="h-4 w-4" />
          Ativas
          {ativas.length > 0 && (
            <span className="bg-neutral-900 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {ativas.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAba("historico")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            aba === "historico" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <History className="h-4 w-4" />
          Histórico
        </button>
      </div>

      {/* Lista de entregas */}
      {aba === "ativas" && (
        <div className="space-y-3">
          {ativas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-neutral-400">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma entrega ativa</p>
                <p className="text-sm">Clique em "Nova entrega" para começar</p>
              </CardContent>
            </Card>
          ) : (
            ativas.map((d) => (
              <DeliveryCard
                key={d.id}
                delivery={d}
                onDispatch={handleDispatch}
                onComplete={handleComplete}
              />
            ))
          )}
        </div>
      )}

      {aba === "historico" && (
        <div className="space-y-3">
          {historico.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-neutral-400">
                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma entrega no histórico</p>
              </CardContent>
            </Card>
          ) : (
            historico.map((d) => <DeliveryCard key={d.id} delivery={d} />)
          )}
        </div>
      )}
    </div>
  )
}
