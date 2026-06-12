import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data, error } = await supabase
    .from("deliveries")
    .update({ status: "dispatched", dispatched_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: "Erro ao despachar" }, { status: 500 })
  return NextResponse.json(data)
}
