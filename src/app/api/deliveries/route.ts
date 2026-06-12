import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { novaEntregaSchema } from "@/lib/validations"
import { gerarToken } from "@/lib/tokens"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_user_id", user.id)
    .single()

  if (!store) return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })

  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  const parsed = novaEntregaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 })
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_user_id", user.id)
    .single()

  if (!store) return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })

  const { data, error } = await supabase
    .from("deliveries")
    .insert({
      store_id: store.id,
      customer_name: parsed.data.customer_name,
      customer_address: parsed.data.customer_address,
      ifood_order_id: parsed.data.ifood_order_id ?? null,
      courier_token: gerarToken(),
      customer_token: gerarToken(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
