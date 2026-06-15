"use client"

import { useState } from "react"
import { MapPin, Clock, User, Truck, CheckCircle, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, statusLabel, statusColor, tempoDecorrido } from "@/lib/utils"
import { useDeliveryLocation } from "@/lib/hooks/useDeliveryLocation"
import type { Delivery } from "@/types/database"
import dynamic from "next/dynamic"

const DeliveryMap = dynamic(() => import("@/components/map/DeliveryMap"), { ssr: false })

interface DeliveryCardProps {
  delivery: Delivery
  onDispatch?: (id: string) => Promise<void>
  onComplete?: (id: string) => Promise<void>
}

export function DeliveryCard({ delivery, onDispatch, onComplete }: DeliveryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [copiedCourier, setCopiedCourier] = useState(false)
  const [copiedCustomer, setCopiedCustomer] = useState(false)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const courierUrl = `${baseUrl}/entregador/${delivery.courier_token}`
  const customerUrl = `${baseUrl}/rastreio/${delivery.customer_token}`

  async function handleCopy(url: string, tipo: "courier" | "customer") {
    await navigator.clipboard.writeText(url)
    if (tipo === "courier") {
      setCopiedCourier(true)
      setTimeout(() => setCopiedCourier(false), 2000)
    } else {
      setCopiedCustomer(true)
      setTimeout(() => setCopiedCustomer(false), 2000)
    }
  }

  async function handleDispatch() {
    if (!onDispatch) return
    setLoadingAction(true)
    await onDispatch(delivery.id)
    setLoadingAction(false)
  }

  async function handleComplete() {
    if (!onComplete) return
    setLoadingAction(true)
    await onComplete(delivery.id)
    setLoadingAction(false)
  }

  const emTransito = delivery.status === "dispatched" || delivery.status === "nearby"
  const isAtivo = delivery.status === "pending" || emTransito

  // Só assina o Realtime quando o card está aberto e a entrega está em trânsito
  const livePosition = useDeliveryLocation(delivery.id, expanded && emTransito)

  return (
    <Card className={cn("transition-all", !isAtivo && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-neutral-400 shrink-0" />
              <span className="font-medium truncate">{delivery.customer_name}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", statusColor(delivery.status))}>
                {statusLabel(delivery.status)}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/50">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="truncate">{delivery.customer_address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/35 mt-1">
              <Clock className="h-3 w-3" />
              <span>{tempoDecorrido(delivery.created_at)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            {/* Links */}
            <div className="space-y-2">
              <LinkRow
                label="Entregador"
                url={courierUrl}
                copied={copiedCourier}
                onCopy={() => handleCopy(courierUrl, "courier")}
              />
              <LinkRow
                label="Cliente"
                url={customerUrl}
                copied={copiedCustomer}
                onCopy={() => handleCopy(customerUrl, "customer")}
              />
            </div>

            {/* Mapa miniatura ao vivo — só quando em trânsito */}
            {emTransito ? (
              <div className="relative h-48 rounded-lg overflow-hidden border">
                <DeliveryMap position={livePosition} className="h-full w-full" />
                {!livePosition && (
                  <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/60 pointer-events-none">
                    <div className="text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white/40 mx-auto mb-1" />
                      <p className="text-xs text-white/50">Aguardando posição do entregador...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Ações */}
            <div className="flex gap-2">
              {delivery.status === "pending" && onDispatch && (
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={handleDispatch}
                  disabled={loadingAction}
                >
                  <Truck className="h-4 w-4" />
                  Despachar
                </Button>
              )}
              {(delivery.status === "dispatched" || delivery.status === "nearby") && onComplete && (
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1 gap-1"
                  onClick={handleComplete}
                  disabled={loadingAction}
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar entregue
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LinkRow({ label, url, copied, onCopy }: {
  label: string
  url: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-white/45 w-20 shrink-0">{label}:</span>
      <code className="flex-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 truncate text-white/60">
        {url}
      </code>
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onCopy}>
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
