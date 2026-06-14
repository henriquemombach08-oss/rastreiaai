import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Truck, Link2, Map } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-neutral-100 px-4 h-14 flex items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-neutral-900 rounded-lg p-1.5">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">Rastreaí</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="bg-neutral-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors font-medium"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-sm px-3 py-1.5 rounded-full mb-8">
            <span className="h-2 w-2 bg-green-500 rounded-full inline-block" />
            Para restaurantes com entrega própria no iFood
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-5 leading-tight">
            Seus clientes sabem onde<br className="hidden md:block" />
            {" "}o entregador está.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-xl mx-auto">
            Rastreamento em tempo real para entregas próprias.
            Sem app. O cliente abre só um link.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-base px-6 py-3 rounded-xl hover:bg-neutral-700 transition-colors font-medium"
          >
            Começar grátis
            <span aria-hidden>→</span>
          </Link>
        </section>

        {/* How it works */}
        <section className="bg-neutral-50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12 tracking-tight">
              Como funciona
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-2xl p-4 inline-flex mb-4 shadow-sm border border-neutral-100">
                  <Truck className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold mb-2">1. Nova entrega</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Cadastre o pedido no dashboard com o nome e endereço do cliente.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-4 inline-flex mb-4 shadow-sm border border-neutral-100">
                  <Link2 className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold mb-2">2. Entregador recebe o link</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Um link exclusivo é gerado. O entregador abre no celular e a localização é
                  transmitida automaticamente.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-4 inline-flex mb-4 shadow-sm border border-neutral-100">
                  <Map className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold mb-2">3. Cliente acompanha no mapa</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  O cliente vê o entregador em tempo real. Sem instalar nada, só com o link.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 text-center px-4">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            Pronto para começar?
          </h2>
          <p className="text-neutral-500 mb-8">
            Crie sua conta e registre sua primeira entrega em menos de 2 minutos.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-base px-6 py-3 rounded-xl hover:bg-neutral-700 transition-colors font-medium"
          >
            Criar conta grátis
          </Link>
        </section>
      </main>

      <footer className="border-t border-neutral-100 py-6 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} Rastreaí
      </footer>
    </div>
  )
}
