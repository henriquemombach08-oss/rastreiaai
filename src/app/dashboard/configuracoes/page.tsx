import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreSettingsForm } from "@/components/dashboard/StoreSettingsForm"

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_user_id", user.id)
    .single()

  if (!store) redirect("/dashboard")

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-1">Dados e preferências da sua loja</p>
      </div>
      <StoreSettingsForm store={store} email={user.email ?? ""} />
    </div>
  )
}
