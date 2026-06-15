import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LogOut, MapPin, Settings } from "lucide-react"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <header className="bg-[#090909]/80 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-brand rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-black tracking-tight text-white">Rastreaí</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/configuracoes"
              className="flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
