-- ============================================================
-- Rastreaí — Schema inicial
-- ============================================================

-- Habilitar extensão para geração de UUIDs (já disponível no Supabase)
create extension if not exists "pgcrypto";

-- ============================================================
-- Tabela: stores
-- ============================================================
create table if not exists public.stores (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  ifood_merchant_id text,
  owner_user_id     uuid not null references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- Tabela: deliveries
-- ============================================================
create type public.delivery_status as enum (
  'pending',
  'dispatched',
  'nearby',
  'delivered',
  'canceled'
);

create table if not exists public.deliveries (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references public.stores(id) on delete cascade,
  ifood_order_id   text,
  customer_name    text not null,
  customer_address text not null,
  status           public.delivery_status not null default 'pending',
  courier_token    text not null unique,
  customer_token   text not null unique,
  created_at       timestamptz not null default now(),
  dispatched_at    timestamptz,
  delivered_at     timestamptz
);

-- ============================================================
-- Tabela: delivery_locations
-- ============================================================
create table if not exists public.delivery_locations (
  id          uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  accuracy    real,
  recorded_at timestamptz not null default now()
);

-- ============================================================
-- Índices
-- ============================================================
create index if not exists deliveries_store_id_idx
  on public.deliveries(store_id);

create index if not exists deliveries_status_idx
  on public.deliveries(status);

create index if not exists deliveries_courier_token_idx
  on public.deliveries(courier_token);

create index if not exists deliveries_customer_token_idx
  on public.deliveries(customer_token);

create index if not exists delivery_locations_delivery_id_idx
  on public.delivery_locations(delivery_id, recorded_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.stores enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_locations enable row level security;

-- stores: usuário autenticado só vê/edita sua própria loja
create policy "stores: leitura própria"
  on public.stores for select
  using (owner_user_id = auth.uid());

create policy "stores: inserção própria"
  on public.stores for insert
  with check (owner_user_id = auth.uid());

create policy "stores: atualização própria"
  on public.stores for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- deliveries: loja só vê entregas que pertencem às suas stores
create policy "deliveries: leitura da loja"
  on public.deliveries for select
  using (
    store_id in (
      select id from public.stores where owner_user_id = auth.uid()
    )
  );

create policy "deliveries: inserção da loja"
  on public.deliveries for insert
  with check (
    store_id in (
      select id from public.stores where owner_user_id = auth.uid()
    )
  );

create policy "deliveries: atualização da loja"
  on public.deliveries for update
  using (
    store_id in (
      select id from public.stores where owner_user_id = auth.uid()
    )
  );

-- delivery_locations: loja só vê localizações das suas entregas
create policy "delivery_locations: leitura da loja"
  on public.delivery_locations for select
  using (
    delivery_id in (
      select d.id from public.deliveries d
      join public.stores s on s.id = d.store_id
      where s.owner_user_id = auth.uid()
    )
  );

-- NOTA: inserção/leitura de entregador e cliente acontece APENAS via
-- API routes com service_role key — nunca diretamente pelo client
