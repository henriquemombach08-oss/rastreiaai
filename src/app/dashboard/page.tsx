import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Busca ou cria a loja do usuário
  let { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_user_id", user.id)
    .single()

  if (!store) {
    const { data: novaLoja } = await supabase
      .from("stores")
      .insert({ name: "Minha Loja", owner_user_id: user.id })
      .select()
      .single()
    store = novaLoja
  }

  if (!store) {
    return <div className="text-center py-20 text-neutral-500">Erro ao carregar loja.</div>
  }

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return <DashboardClient store={store} initialDeliveries={deliveries ?? []} />
}
