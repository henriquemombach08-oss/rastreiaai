"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (senha.length < 6) { setErro("A senha deve ter ao menos 6 caracteres."); return }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return }
    setCarregando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) { setErro("Erro ao redefinir senha. Solicite um novo link."); return }
      router.push("/dashboard")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] text-white p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand rounded-xl p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Rastreaí</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>Escolha uma senha segura para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="senha">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrar ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(!mostrar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmar">Confirmar nova senha</Label>
                <Input
                  id="confirmar"
                  type={mostrar ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>

              {erro && (
                <p className="text-sm rounded p-2 border bg-red-500/10 text-red-400 border-red-500/20">
                  {erro}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
