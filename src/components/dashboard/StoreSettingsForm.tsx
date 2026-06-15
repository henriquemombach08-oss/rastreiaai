"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cadastroLojaSchema, type CadastroLojaInput } from "@/lib/validations"
import type { Store } from "@/types/database"

interface StoreSettingsFormProps {
  store: Store
  email: string
}

export function StoreSettingsForm({ store, email }: StoreSettingsFormProps) {
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "ok" | "erro" } | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroLojaInput>({
    resolver: zodResolver(cadastroLojaSchema),
    defaultValues: { name: store.name },
  })

  async function onSubmit(data: CadastroLojaInput) {
    setSalvando(true)
    setMensagem(null)
    try {
      const res = await fetch("/api/stores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setMensagem({ texto: "Salvo com sucesso!", tipo: "ok" })
      } else {
        const body = await res.json().catch(() => ({}))
        setMensagem({ texto: body.error ?? "Erro ao salvar. Tente novamente.", tipo: "erro" })
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da loja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da loja</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>E-mail da conta</Label>
              <Input value={email} disabled className="text-neutral-500" />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={salvando}>
                {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                {salvando ? "Salvando…" : "Salvar"}
              </Button>
              {mensagem && (
                <span
                  className={`text-sm ${
                    mensagem.tipo === "ok" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {mensagem.texto}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integração iFood</CardTitle>
          <CardDescription>
            Automatize a criação de entregas a partir dos pedidos do iFood.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            Disponível em breve. Por enquanto, crie as entregas manualmente no dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
