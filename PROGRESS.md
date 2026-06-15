# Rastreaí — estado do projeto e próximos passos

> Documento de handoff. Lido por uma nova sessão do Claude Code para retomar o
> contexto. Atualize conforme o projeto evolui.

## O que é

**Rastreaí** — SaaS de rastreamento de entregas em tempo real para restaurantes
que fazem **entrega própria** no iFood (o iFood não oferece rastreamento quando
a loja entrega por conta própria). Para cada entrega, o sistema gera dois links
únicos por token:

- **Link do entregador** (`/entregador/[token]`): PWA que transmite GPS
- **Link do cliente** (`/rastreio/[token]`): página pública com mapa ao vivo

## Stack

- **Next.js 15** (App Router, TypeScript estrito, sem `any`)
- **Supabase** (Postgres, Auth, Realtime broadcast, RLS)
- **Tailwind CSS v4** + componentes estilo shadcn/ui (instalados manualmente)
- **Leaflet + MapTiler** para os mapas (cobre o Brasil inteiro)
- **Framer Motion** para animações da landing
- **Zod** para validação, **nanoid** para tokens (48 chars)
- Fonte: **Syne** (next/font/google)

## Convenção importante do repo

Leia `AGENTS.md`: esta versão do Next.js pode ter breaking changes vs. o que
você conhece. Consulte `node_modules/next/dist/docs/` antes de escrever código.
Lembrete prático já confirmado: em rotas/páginas, `params` é `Promise<{...}>` —
precisa de `await params` (server) ou `params.then(...)` (client).

## Design system (estado atual)

Migrado de "SaaS genérico claro" para **dark, estilo Linear / Hackatime**:

- Fundo base `#090909`; cards com borda `1px rgba(255,255,255,0.06)`
- Cor de marca (vermelho terroso, tipo argila/deserto de Montana), definida em
  `src/app/globals.css` via `@theme`:
  - `--color-brand: #B83A28` (principal) / `--color-brand-dark: #9C3020` (hover)
  - `--color-brand-mid: #CC4530` / `--color-brand-light: #F9EDE9` / `--color-brand-muted: #F2DBD6`
  - Use sempre as utilities `bg-brand`, `text-brand`, `hover:bg-brand-dark` etc.
- Tipografia: hierarquia em branco com opacidade (`white/45`, `white/35`, `white/15`)
- Hero: glow radial da cor de marca, grid de pontos com máscara, vinheta,
  mockup de celular com tilt 3D (CSS perspective) + cards flutuantes
- Animações: Framer Motion — entrada staggered no hero, telefone flutuando em
  loop, scroll-triggers (`whileInView`) nas seções. Easing `[0.22,1,0.36,1]`.

## O que já está feito

- Schema Supabase + RLS (migration em `supabase/migrations/001_initial_schema.sql`)
- Fluxo manual ponta a ponta: criar entrega → link entregador → link cliente
- PWA do entregador (GPS watchPosition, Wake Lock, fila offline, broadcast ~5s)
- Página do cliente (mapa Leaflet, animação suave do marcador, reconexão resiliente)
- Dashboard da loja (auth, lista ativas/histórico, Realtime, nova entrega)
- **Landing page redesenhada** (dark, animada) — `src/components/landing/LandingPage.tsx`
- Página de configurações da loja (`/dashboard/configuracoes`) + `PATCH /api/stores`
- Página 404 customizada, banner de onboarding (renomear loja)
- Integração iFood (webhook + polling) escrita mas atrás de `IFOOD_ENABLED=false`

## Próximos passos sugeridos

1. **Redesenhar o dashboard** no mesmo estilo dark/Linear da landing
   (`src/app/dashboard/layout.tsx`, `DashboardClient.tsx`, componentes em
   `src/components/dashboard/`)
2. **Redesenhar a página de login** (`src/app/(auth)/login/page.tsx`) com a
   mesma identidade visual
3. **Adicionar o logo** quando o arquivo estiver pronto (substituir o ícone
   `MapPin` no header/nav por `<Image>`)
4. Polir páginas do entregador e do cliente para o tema dark
5. (Futuro) Fluxo OAuth "Conectar com iFood" e UI de `ifood_merchant_id` —
   depende do dono ter CNPJ com CNAE de tecnologia (planejado para setembro/2026)

## Configuração local

Crie `.env.local` (não vai pro Git) com as chaves do Supabase. Falta preencher:

- `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → projeto rastreiaai →
  Settings → API → `service_role` (sem ela, criar entrega e rastreio por token
  não funcionam)
- `NEXT_PUBLIC_MAPTILER_KEY` (opcional) — tiles de produção, free em maptiler.com

```bash
npm install
npm run dev   # http://localhost:3000
```

## Segurança (regras invioláveis)

- Nunca expor a `service_role` key no client
- Tokens com ≥ 32 bytes de entropia (nanoid/crypto)
- Acesso de entregador/cliente é por token via API routes (service role),
  nunca direto no banco
- TypeScript estrito, sem `any`
- Comentários e textos da UI em português brasileiro
