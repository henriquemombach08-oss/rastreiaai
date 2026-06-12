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
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-800 text-base">Entrega criada com sucesso!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LinkItem
          label="Link do Entregador"
          url={courierUrl}
          icon={<Truck className="h-4 w-4" />}
          copied={copiedCourier}
          onCopy={() => copiar(courierUrl, "courier")}
          colorClass="bg-blue-50 border-blue-200"
        />
        <LinkItem
          label="Link do Cliente"
          url={customerUrl}
          icon={<Eye className="h-4 w-4" />}
          copied={copiedCustomer}
          onCopy={() => copiar(customerUrl, "customer")}
          colorClass="bg-purple-50 border-purple-200"
        />
        <p className="text-xs text-neutral-500">
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
  colorClass,
}: {
  label: string
  url: string
  icon: React.ReactNode
  copied: boolean
  onCopy: () => void
  colorClass: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-neutral-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white rounded px-2 py-1.5 border truncate text-neutral-700">
          {url}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="shrink-0 gap-1"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
    </div>
  )
}
