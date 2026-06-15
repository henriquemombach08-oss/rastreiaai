"use client"

import { useState } from "react"
import { Copy, Check, Truck, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DeliveryLinksProps {
  courierToken: string
  customerToken: string
}

export function DeliveryLinks({ courierToken, customerToken }: DeliveryLinksProps) {
  const [copiedCourier, setCopiedCourier] = useState(false)
  const [copiedCustomer, setCopiedCustomer] = useState(false)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const courierUrl = `${baseUrl}/entregador/${courierToken}`
  const customerUrl = `${baseUrl}/rastreio/${customerToken}`

  async function copiar(texto: string, tipo: "courier" | "customer") {
    await navigator.clipboard.writeText(texto)
    if (tipo === "courier") {
      setCopiedCourier(true)
      setTimeout(() => setCopiedCourier(false), 2000)
    } else {
      setCopiedCustomer(true)
      setTimeout(() => setCopiedCustomer(false), 2000)
    }
  }

  return (
    <Card className="border-green-500/20 bg-green-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-base">Entrega criada com sucesso!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LinkItem
          label="Link do Entregador"
          url={courierUrl}
          icon={<Truck className="h-4 w-4 text-white/60" />}
          copied={copiedCourier}
          onCopy={() => copiar(courierUrl, "courier")}
        />
        <LinkItem
          label="Link do Cliente"
          url={customerUrl}
          icon={<Eye className="h-4 w-4 text-white/60" />}
          copied={copiedCustomer}
          onCopy={() => copiar(customerUrl, "customer")}
        />
        <p className="text-xs text-white/40">
          Envie o link do cliente via WhatsApp. O link do entregador deve ser aberto no celular do motoboy.
        </p>
      </CardContent>
    </Card>
  )
}

function LinkItem({
  label,
  url,
  icon,
  copied,
  onCopy,
}: {
  label: string
  url: string
  icon: React.ReactNode
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-white/60">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white/[0.04] rounded px-2 py-1.5 border border-white/[0.08] truncate text-white/60">
          {url}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="shrink-0 gap-1"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
    </div>
  )
}
