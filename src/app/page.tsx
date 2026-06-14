import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-neutral-950">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/90 backdrop-blur-md border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-black tracking-tight text-neutral-950">Rastreaí</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="bg-brand hover:bg-brand-dark text-white text-sm px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-16 pb-24 lg:min-h-[calc(100vh-56px)]">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-brand-light border border-brand-muted text-brand text-xs font-semibold px-3 py-1.5 rounded-full mb-10 uppercase tracking-widest">
            Para entrega própria no iFood
          </div>

          <h1 className="text-[3rem] md:text-[4rem] lg:text-[4.25rem] font-black leading-[1.06] tracking-[-0.03em] mb-6">
            Seus clientes<br />
            param de<br />
            <span className="text-brand">perguntar.</span>
          </h1>

          <p className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-md">
            Rastreaí gera um link de rastreamento em tempo real para cada entrega.
            O cliente vê o entregador no mapa. Sem app, sem cadastro, sem complicação.
          </p>

          <div className="flex items-center gap-5 mb-12">
            <Link
              href="/login"
              className="bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="text-neutral-500 hover:text-neutral-900 transition-colors font-medium text-sm flex items-center gap-1"
            >
              Já tenho conta <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
            {["Sem instalar app", "Sem taxa por entrega", "Grátis para começar"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-orange-400 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Phone mockup */}
        <div className="flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="bg-white border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-5 py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-12">
            Como funciona
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-100 rounded-2xl overflow-hidden">
            {[
              {
                num: "01",
                title: "Nova entrega",
                body: "Cadastre o pedido no dashboard com o nome e endereço do cliente. Os links são gerados na hora.",
              },
              {
                num: "02",
                title: "Entregador sai",
                body: "Ele abre o link no celular. O GPS começa a transmitir automaticamente. Nenhum app necessário.",
              },
              {
                num: "03",
                title: "Cliente acompanha",
                body: "Um link. Mapa ao vivo. Sem instalar nada. O cliente vê onde está o entregador em tempo real.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="bg-white p-8 md:p-10">
                <p className="text-4xl font-black text-neutral-100 mb-6 tabular-nums">{num}</p>
                <h3 className="font-bold text-lg text-neutral-950 mb-3">{title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final (dark) ── */}
      <section className="bg-neutral-950">
        <div className="max-w-6xl mx-auto px-5 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-[-0.02em] mb-3">
              Pronto para testar?
            </h2>
            <p className="text-neutral-400 text-lg">
              Sua primeira entrega rastreada em menos de 2 minutos.
            </p>
          </div>
          <Link
            href="/login"
            className="flex-shrink-0 bg-brand hover:bg-brand-mid text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Criar conta grátis →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-neutral-950 border-t border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-md p-1">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span className="text-white/40 text-sm font-semibold">Rastreaí</span>
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="relative select-none">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-brand/10 blur-3xl rounded-full scale-110 pointer-events-none" />

      {/* Phone body */}
      <div className="relative bg-neutral-950 w-[264px] h-[536px] rounded-[46px] p-[10px] shadow-2xl ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 h-[26px] w-[82px] bg-neutral-950 rounded-full z-20" />

        {/* Screen */}
        <div className="rounded-[38px] h-full bg-[#e6ede0] overflow-hidden relative">

          {/* Map background — stylised tiles */}
          <div
            className="absolute inset-0"
            style={{
              background: "#e8f0e0",
              backgroundImage: `
                linear-gradient(to right, #d6dfcf 1px, transparent 1px),
                linear-gradient(to bottom, #d6dfcf 1px, transparent 1px)
              `,
              backgroundSize: "44px 56px",
            }}
          />

          {/* City blocks */}
          {[
            { t: "8%",  l: "12%", w: "22%", h: "14%" },
            { t: "8%",  r: "10%", w: "18%", h: "12%" },
            { t: "30%", l: "8%",  w: "16%", h: "18%" },
            { t: "28%", r: "6%",  w: "20%", h: "14%" },
            { t: "54%", l: "16%", w: "14%", h: "12%" },
            { t: "52%", r: "18%", w: "16%", h: "10%" },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute bg-[#d8e4d0] rounded-[3px]"
              style={{ top: s.t, left: s.l, right: s.r, width: s.w, height: s.h }}
            />
          ))}

          {/* Route — dashed orange line */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 264 536"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 90 420 C 90 330 80 260 200 160"
              stroke="#B83A28"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.85"
            />
          </svg>

          {/* Destination pin */}
          <div className="absolute" style={{ top: "26%", left: "72%" }}>
            <div className="flex flex-col items-center">
              <div className="h-5 w-5 bg-neutral-900 rounded-full border-2 border-white shadow-md" />
              <div className="w-0.5 h-2.5 bg-neutral-900" />
              <div className="w-2 h-2 bg-neutral-900 rotate-45 -mt-1 rounded-[2px]" />
            </div>
          </div>

          {/* Courier — pulsing orange dot */}
          <div className="absolute" style={{ top: "73%", left: "30%" }}>
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-brand/30 animate-ping -top-2.5 -left-2.5" />
            <div className="relative h-5 w-5 bg-brand rounded-full shadow-lg ring-2 ring-white flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Bottom tracking card */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/96 backdrop-blur-sm rounded-t-[28px] pt-4 pb-5 px-4 shadow-2xl">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                Ao vivo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0 text-base">
                🍔
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 leading-none mb-1">
                  Hambúrguer do Bairro
                </p>
                <p className="text-xs text-neutral-400">Saiu há 4 min · A caminho</p>
              </div>
            </div>
            <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full w-[58%] bg-brand rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
