"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MapPin, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { loginSchema, type LoginInput } from "@/lib/validations"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [erro, setErro] = useState<string | null>(searchParams.get("erro"))
  const [modo, setModo] = useState<"login" | "cadastro" | "recuperar">("login")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState("")
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function enviarRecuperacao(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!emailRecuperacao) { setErro("Digite seu e-mail."); return }
    setEnviandoRecuperacao(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/redefinir-senha`,
      })
      if (error) {
        const msgs: Record<string, string> = {
          "email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          "over_email_send_rate_limit": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        }
        setErro(msgs[error.message] ?? msgs[error.code ?? ""] ?? "Erro ao enviar e-mail. Verifique o endereço.")
        return
      }
      setRecuperacaoEnviada(true)
    } finally {
      setEnviandoRecuperacao(false)
    }
  }

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
    <div className="min-h-screen flex items-center justify-center bg-[#090909] text-white p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand rounded-xl p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Rastreaí</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {modo === "login" ? "Entrar na sua conta" : modo === "cadastro" ? "Criar conta" : "Recuperar senha"}
            </CardTitle>
            <CardDescription>
              {modo === "login"
                ? "Acesse o painel de entregas da sua loja"
                : modo === "cadastro"
                ? "Comece a rastrear suas entregas agora"
                : "Enviaremos um link de redefinição para seu e-mail"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modo === "recuperar" ? (
              recuperacaoEnviada ? (
                <div className="space-y-4">
                  <p className="text-sm bg-green-500/10 text-green-400 border border-green-500/20 rounded p-3">
                    E-mail enviado! Verifique sua caixa de entrada e clique no link para redefinir a senha.
                  </p>
                  <button
                    type="button"
                    className="w-full text-sm text-white/45 hover:text-white transition-colors"
                    onClick={() => { setModo("login"); setRecuperacaoEnviada(false); setErro(null) }}
                  >
                    ← Voltar para o login
                  </button>
                </div>
              ) : (
                <form onSubmit={enviarRecuperacao} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-rec">E-mail</Label>
                    <Input
                      id="email-rec"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      value={emailRecuperacao}
                      onChange={(e) => setEmailRecuperacao(e.target.value)}
                    />
                  </div>
                  {erro && (
                    <p className="text-sm rounded p-2 border bg-red-500/10 text-red-400 border-red-500/20">{erro}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={enviandoRecuperacao}>
                    {enviandoRecuperacao && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enviar link de recuperação
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-white/45 hover:text-white transition-colors"
                    onClick={() => { setModo("login"); setErro(null) }}
                  >
                    ← Voltar para o login
                  </button>
                </form>
              )
            ) : (
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
                    <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {modo === "login" && (
                      <button
                        type="button"
                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
                        onClick={() => { setModo("recuperar"); setErro(null) }}
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={mostrarSenha ? "text" : "password"}
                      autoComplete={modo === "login" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                      tabIndex={-1}
                    >
                      {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {erro && (
                  <p className={`text-sm rounded p-2 border ${
                    erro.includes("Confirme")
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
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
                  className="w-full text-sm text-white/45 hover:text-white transition-colors"
                  onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(null) }}
                >
                  {modo === "login" ? "Não tem conta? Criar agora" : "Já tenho conta → Entrar"}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
