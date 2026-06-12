"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { loginSchema, type LoginInput } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [modo, setModo] = useState<"login" | "cadastro">("login")

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setErro(null)
    const supabase = createClient()

    if (modo === "cadastro") {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      if (error) { setErro(error.message); return }
      setErro("Confirme seu e-mail para continuar.")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setErro("E-mail ou senha incorretos.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-neutral-900 rounded-xl p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Rastreaí</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{modo === "login" ? "Entrar na sua conta" : "Criar conta"}</CardTitle>
            <CardDescription>
              {modo === "login"
                ? "Acesse o painel de entregas da sua loja"
                : "Comece a rastrear suas entregas agora"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              {erro && (
                <p className={`text-sm rounded p-2 ${
                  erro.includes("Confirme") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"
                }`}>
                  {erro}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {modo === "login" ? "Entrar" : "Criar conta"}
              </Button>

              <button
                type="button"
                className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(null) }}
              >
                {modo === "login" ? "Não tem conta? Criar agora" : "Já tenho conta → Entrar"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
