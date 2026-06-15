"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryLinks } from "@/components/dashboard/DeliveryLinks"
import { novaEntregaSchema, type NovaEntregaInput } from "@/lib/validations"

interface NovaEntregaFormProps {
  storeId: string
  onSuccess?: () => void
}

interface EntregaCriada {
  courier_token: string
  customer_token: string
}

export function NewDeliveryForm({ storeId, onSuccess }: NovaEntregaFormProps) {
  const [entregaCriada, setEntregaCriada] = useState<EntregaCriada | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<NovaEntregaInput>({
    resolver: zodResolver(novaEntregaSchema),
    defaultValues: { customer_name: "", customer_address: "" },
  })

  async function onSubmit(data: NovaEntregaInput) {
    setErro(null)
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, store_id: storeId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setErro(body.error ?? "Erro ao criar entrega")
      return
    }

    const delivery = await res.json()
    setEntregaCriada({ courier_token: delivery.courier_token, customer_token: delivery.customer_token })
    form.reset()
    onSuccess?.()
  }

  if (entregaCriada) {
    return (
      <div className="space-y-4">
        <DeliveryLinks
          courierToken={entregaCriada.courier_token}
          customerToken={entregaCriada.customer_token}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setEntregaCriada(null)}
        >
          <Plus className="h-4 w-4" />
          Nova entrega
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nova entrega manual</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer_name">Nome do cliente</Label>
            <Input
              id="customer_name"
              placeholder="Ex: João Silva"
              {...form.register("customer_name")}
            />
            {form.formState.errors.customer_name && (
              <p className="text-xs text-red-400">
                {form.formState.errors.customer_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer_address">Endereço de entrega</Label>
            <Input
              id="customer_address"
              placeholder="Ex: Rua das Flores, 123 - Jardins"
              {...form.register("customer_address")}
            />
            {form.formState.errors.customer_address && (
              <p className="text-xs text-red-400">
                {form.formState.errors.customer_address.message}
              </p>
            )}
          </div>

          {erro && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">{erro}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Criar entrega
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
