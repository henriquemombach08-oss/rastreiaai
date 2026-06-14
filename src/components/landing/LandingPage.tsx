"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { MapPin, CheckCircle, Package, Clock } from "lucide-react"

/* ─── Variantes reutilizáveis ─── */
const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

/* ─── Componente principal ─── */
export function LandingPage() {
  const { scrollY } = useScroll()
  /* Glow do hero se desloca levemente com o scroll — efeito parallax sutil */
  const glowY = useTransform(scrollY, [0, 600], [0, 80])

  return (
    <div className="min-h-screen bg-[#090909] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#090909]/85 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-black tracking-tight text-white">Rastreaí</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-white/40 hover:text-white/80 transition-colors font-medium">
              Entrar
            </Link>
            <Link href="/login" className="bg-brand hover:bg-brand-dark text-white text-sm px-4 py-2 rounded-lg transition-colors font-semibold">
              Criar conta
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-56px)] flex items-center">

        {/* Glows com parallax */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: glowY }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(184,58,40,0.22) 0%, transparent 60%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 50% at 85% 60%, rgba(184,58,40,0.08) 0%, transparent 55%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }} />
        </motion.div>

        {/* Grid de pontos */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-6 items-center py-20 lg:py-0">

          {/* Texto — staggered */}
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-brand/25 bg-brand/[0.07] text-brand text-[10px] font-bold px-3 py-1.5 rounded-full mb-10 uppercase tracking-[0.2em]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse inline-block" />
              Rastreamento para entrega própria no iFood
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[2.6rem] md:text-[3.6rem] lg:text-[4rem] font-extrabold leading-[1.05] tracking-[-0.035em] mb-7">
              Seus clientes<br />
              param de<br />
              <span className="text-brand">perguntar.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[15px] text-white/45 leading-[1.8] mb-10 max-w-[400px]">
              Um link por entrega. O cliente vê o entregador no mapa em tempo
              real. Sem app, sem cadastro, sem complicação.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-5 mb-12">
              <Link href="/login" className="bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-[15px]">
                Começar grátis
              </Link>
              <Link href="/login" className="text-white/35 hover:text-white/65 transition-colors font-medium text-sm flex items-center gap-1.5">
                Já tenho conta <span aria-hidden>→</span>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2.5 text-[12px] text-white/25">
              {["Sem instalar app", "Sem taxa por entrega", "Grátis para começar"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-brand/50 inline-block" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual — entra da direita */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="flex justify-center lg:justify-end"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* ── Métricas — scroll trigger ── */}
      <section className="border-t border-white/[0.05]">
        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05]"
        >
          {[
            { valor: "<5s",  label: "Latência GPS → mapa" },
            { valor: "48",   label: "Chars de entropia / token" },
            { valor: "0",    label: "Apps para instalar" },
            { valor: "R$0",  label: "Taxa por entrega" },
          ].map(({ valor, label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="bg-[#090909] px-8 py-10"
            >
              <p className="text-3xl font-extrabold text-white mb-2 tracking-tight">{valor}</p>
              <p className="text-[11px] text-white/30 leading-snug uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Como funciona — scroll trigger ── */}
      <section className="border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-5 py-24">

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand mb-14"
          >
            Como funciona
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]"
          >
            {[
              {
                num: "01",
                title: "Nova entrega",
                body: "Cadastre o pedido com nome e endereço do cliente. Links gerados na hora, sem configuração.",
              },
              {
                num: "02",
                title: "Entregador sai",
                body: "Ele abre o link no celular. GPS começa a transmitir automaticamente. Zero app, zero login.",
              },
              {
                num: "03",
                title: "Cliente acompanha",
                body: "Mapa ao vivo com só o link. O cliente vê onde está o entregador em tempo real.",
              },
            ].map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="p-8 md:p-10">
                <p className="text-[3.5rem] font-extrabold text-white/[0.04] mb-7 tabular-nums leading-none select-none">
                  {num}
                </p>
                <h3 className="font-bold text-[15px] text-white mb-3 tracking-[-0.01em]">{title}</h3>
                <p className="text-white/38 leading-[1.75] text-sm">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA final — scroll trigger ── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="border-t border-white/[0.05]"
      >
        <div className="max-w-6xl mx-auto px-5 py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <h2 className="text-[2rem] md:text-[2.5rem] font-extrabold text-white leading-tight tracking-[-0.025em] mb-3">
              Pronto para rastrear?
            </h2>
            <p className="text-white/38 text-[15px]">Primeira entrega em menos de 2 minutos.</p>
          </div>
          <Link href="/login" className="flex-shrink-0 bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-xl transition-colors text-[15px] whitespace-nowrap">
            Criar conta grátis →
          </Link>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-white/[0.05] py-7"
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand rounded-md p-1">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span className="text-white/25 text-sm font-bold">Rastreaí</span>
          </div>
          <p className="text-white/12 text-xs">© {new Date().getFullYear()}</p>
        </div>
      </motion.footer>
    </div>
  )
}

/* ─────────────────────────────────────────
   Hero visual: telefone 3D + cards flutuantes
───────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-[320px] h-[560px] lg:w-[390px] lg:h-[620px]">

      {/* Glow atrás */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/12 rounded-full blur-3xl pointer-events-none" />

      {/* Card flutuante esquerda — entra com delay */}
      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.65, ease }}
        style={{ rotate: -2 }}
        className="absolute top-6 -left-4 lg:-left-10 z-20 w-52 rounded-2xl border border-white/[0.08] bg-[#111]/90 backdrop-blur-xl p-3.5 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
            <Package className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white">Entregas ativas</span>
          <span className="ml-auto bg-brand/20 text-brand text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
        </div>
        {[
          { nome: "João Silva",  status: "A caminho",  dot: "bg-green-400" },
          { nome: "Ana Souza",   status: "Aguardando", dot: "bg-yellow-400" },
        ].map(({ nome, status, dot }) => (
          <div key={nome} className="flex items-center gap-2 py-1.5 border-t border-white/[0.05] first:border-0">
            <span className={`h-1.5 w-1.5 rounded-full ${dot} flex-shrink-0`} />
            <span className="text-[11px] text-white/70 flex-1 truncate">{nome}</span>
            <span className="text-[10px] text-white/35">{status}</span>
          </div>
        ))}
      </motion.div>

      {/* Telefone — 3D tilt + flutuação contínua */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1100px" }}
      >
        <motion.div
          style={{ rotateY: -14, rotateX: 4 }}
          animate={{ y: [0, -11, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        >
          <PhoneMockup />
        </motion.div>
      </div>

      {/* Card flutuante direita — entra com delay maior */}
      <motion.div
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.85, ease }}
        style={{ rotate: 2 }}
        className="absolute bottom-10 -right-4 lg:-right-8 z-20 w-48 rounded-2xl border border-white/[0.08] bg-[#111]/90 backdrop-blur-xl p-3.5 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-[11px] font-bold text-white">Entregue agora</span>
        </div>
        <p className="text-[11px] text-white/50 mb-2">Pedro Almeida · Rua das Flores, 90</p>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-white/25" />
          <span className="text-[10px] text-white/30">há 2 min</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Phone CSS mockup ─── */
function PhoneMockup() {
  return (
    <div className="relative select-none w-[230px] h-[468px] lg:w-[252px] lg:h-[514px]">
      <div className="absolute inset-0 bg-[#050505] rounded-[44px] ring-1 ring-white/[0.1] shadow-[0_40px_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]">
        {/* Notch */}
        <div className="absolute top-[15px] left-1/2 -translate-x-1/2 h-[22px] w-[70px] bg-[#050505] rounded-full z-20" />

        {/* Screen */}
        <div className="absolute inset-[9px] rounded-[36px] overflow-hidden bg-[#141414]">
          {/* Map grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right,  rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "36px 46px",
          }} />

          {/* Blocks */}
          {[
            { top: "8%",  left: "10%", width: "22%", height: "13%" },
            { top: "8%",  right: "8%", width: "20%", height: "11%" },
            { top: "28%", left: "6%",  width: "18%", height: "16%" },
            { top: "26%", right: "5%", width: "22%", height: "13%" },
            { top: "52%", left: "14%", width: "14%", height: "11%" },
            { top: "50%", right: "16%", width: "17%", height: "10%" },
          ].map((s, i) => (
            <div key={i} className="absolute bg-[#1D1D1D] rounded-[3px]" style={s} />
          ))}

          {/* Route */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 252 514" fill="none" preserveAspectRatio="none">
            <path d="M 78 405 C 78 310 75 242 190 150" stroke="#B83A28" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.9" />
          </svg>

          {/* Destination */}
          <div className="absolute" style={{ top: "26%", left: "71%" }}>
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 bg-white rounded-full border-[2.5px] border-[#141414] shadow-md" />
              <div className="w-0.5 h-2 bg-white/50" />
              <div className="w-1.5 h-1.5 bg-white rotate-45 -mt-0.5 rounded-[1px]" />
            </div>
          </div>

          {/* Courier */}
          <div className="absolute" style={{ top: "71%", left: "28%" }}>
            <span className="absolute inline-flex h-9 w-9 rounded-full bg-brand/20 animate-ping -top-2 -left-2" />
            <div className="relative h-5 w-5 bg-brand rounded-full shadow-lg ring-[2.5px] ring-[#141414] flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Bottom card */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A]/96 backdrop-blur-sm rounded-t-[26px] pt-3.5 pb-5 px-4 border-t border-white/[0.07]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Ao vivo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-brand rounded-xl flex items-center justify-center flex-shrink-0 text-sm">🍔</div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-none mb-1 truncate">Hambúrguer do Bairro</p>
                <p className="text-[10px] text-white/35">Saiu há 4 min · A caminho</p>
              </div>
            </div>
            <div className="mt-3 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
              <div className="h-full w-[58%] bg-brand rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
