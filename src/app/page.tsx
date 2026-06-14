import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#090909] text-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#090909]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo mark — trocar por <Image> quando o arquivo chegar */}
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-black tracking-tight text-white">Rastreaí</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm text-white/40 hover:text-white/80 transition-colors font-medium"
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
      <section className="relative overflow-hidden">
        {/* Gradient mesh — glow vermelho terroso no topo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 35% -5%, rgba(184,58,40,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Grid de pontos */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-20 pb-28 lg:min-h-[calc(100vh-56px)]">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 border border-brand/30 bg-brand/8 text-brand text-[11px] font-bold px-3 py-1.5 rounded-full mb-10 uppercase tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse inline-block" />
              Para entrega própria no iFood
            </div>

            <h1 className="text-[2.8rem] md:text-[3.8rem] lg:text-[4.2rem] font-black leading-[1.04] tracking-[-0.035em] mb-7">
              Seus clientes<br />
              param de<br />
              <span className="text-brand">perguntar.</span>
            </h1>

            <p className="text-base text-white/45 leading-[1.75] mb-10 max-w-[420px]">
              Rastreaí gera um link de rastreamento em tempo real para cada
              entrega. O cliente vê o entregador no mapa, sem instalar nada.
            </p>

            <div className="flex items-center gap-5 mb-12">
              <Link
                href="/login"
                className="bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-[15px]"
              >
                Começar grátis
              </Link>
              <Link
                href="/login"
                className="text-white/35 hover:text-white/60 transition-colors font-medium text-sm flex items-center gap-1.5"
              >
                Já tenho conta <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-[13px] text-white/30">
              {["Sem instalar app", "Sem taxa por entrega", "Grátis para começar"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-brand/50 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand mb-14">
            Como funciona
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
            {[
              {
                num: "01",
                title: "Nova entrega",
                body: "Cadastre o pedido no dashboard com nome e endereço do cliente. Links gerados na hora, sem configuração.",
              },
              {
                num: "02",
                title: "Entregador sai",
                body: "Ele abre o link no celular. O GPS começa a transmitir automaticamente. Zero app, zero login.",
              },
              {
                num: "03",
                title: "Cliente acompanha",
                body: "Mapa ao vivo, só com o link. O cliente vê onde está o entregador em tempo real.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="p-8 md:p-10 group">
                <p className="text-[3.5rem] font-black text-white/[0.04] mb-7 tabular-nums leading-none select-none">
                  {num}
                </p>
                <h3 className="font-bold text-[15px] text-white mb-3 tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-white/40 leading-[1.7] text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prova social / detalhe técnico ── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
          {[
            { valor: "<5s",   label: "Latência do GPS ao mapa" },
            { valor: "48",    label: "Chars de entropia por token" },
            { valor: "100%",  label: "Sem app pra instalar" },
            { valor: "0",     label: "Taxa por entrega" },
          ].map(({ valor, label }) => (
            <div key={label} className="bg-[#090909] px-8 py-10">
              <p className="text-3xl font-black text-white mb-2 tracking-tight">{valor}</p>
              <p className="text-[13px] text-white/35 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <h2 className="text-[2rem] md:text-[2.5rem] font-black text-white leading-tight tracking-[-0.025em] mb-3">
              Pronto para rastrear?
            </h2>
            <p className="text-white/40 text-base">
              Primeira entrega em menos de 2 minutos.
            </p>
          </div>
          <Link
            href="/login"
            className="flex-shrink-0 bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-xl transition-colors text-[15px] whitespace-nowrap"
          >
            Criar conta grátis →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-7">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-md p-1">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span className="text-white/30 text-sm font-bold tracking-tight">Rastreaí</span>
          </div>
          <p className="text-white/15 text-xs">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="relative select-none">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-brand/10 blur-3xl rounded-full scale-125 pointer-events-none" />

      {/* Phone body */}
      <div className="relative bg-[#050505] w-[264px] h-[536px] rounded-[46px] p-[10px] shadow-2xl ring-1 ring-white/[0.08]">
        {/* Notch */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 h-[26px] w-[82px] bg-[#050505] rounded-full z-20" />

        {/* Screen — dark map */}
        <div className="rounded-[38px] h-full overflow-hidden relative bg-[#141414]">

          {/* Map grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right,  rgba(255,255,255,0.035) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)
              `,
              backgroundSize: "44px 56px",
            }}
          />

          {/* City blocks */}
          {[
            { top: "8%",  left: "12%", width: "22%", height: "14%" },
            { top: "8%",  right: "10%", width: "18%", height: "12%" },
            { top: "30%", left: "8%",  width: "16%", height: "18%" },
            { top: "28%", right: "6%", width: "20%", height: "14%" },
            { top: "54%", left: "16%", width: "14%", height: "12%" },
            { top: "52%", right: "18%", width: "16%", height: "10%" },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-[3px] bg-[#1E1E1E]"
              style={s}
            />
          ))}

          {/* Route */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 264 536"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 90 420 C 90 330 80 260 200 160"
              stroke="#B83A28"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.9"
            />
          </svg>

          {/* Destination */}
          <div className="absolute" style={{ top: "26%", left: "72%" }}>
            <div className="flex flex-col items-center">
              <div className="h-5 w-5 bg-white rounded-full border-2 border-[#141414] shadow-md" />
              <div className="w-0.5 h-2.5 bg-white/60" />
              <div className="w-2 h-2 bg-white rotate-45 -mt-1 rounded-[2px]" />
            </div>
          </div>

          {/* Courier dot */}
          <div className="absolute" style={{ top: "73%", left: "30%" }}>
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-brand/25 animate-ping -top-2.5 -left-2.5" />
            <div className="relative h-5 w-5 bg-brand rounded-full shadow-lg ring-2 ring-[#141414] flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Bottom info card */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0C0C0C]/95 backdrop-blur-sm rounded-t-[28px] pt-4 pb-5 px-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                Ao vivo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                🍔
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-none mb-1">
                  Hambúrguer do Bairro
                </p>
                <p className="text-xs text-white/35">Saiu há 4 min · A caminho</p>
              </div>
            </div>
            <div className="mt-3.5 h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
              <div className="h-full w-[58%] bg-brand rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
