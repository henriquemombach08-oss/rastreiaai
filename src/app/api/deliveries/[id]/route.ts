import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"
import type { DeliveryStatus } from "@/types/database"

const updateSchema = z.object({
  status: z.enum(["pending", "dispatched", "nearby", "delivered", "canceled"]).optional(),
  customer_name: z.string().min(2).max(120).optional(),
  customer_address: z.string().min(5).max(300).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 })
  }

  const updatePayload: {
    status?: DeliveryStatus
    customer_name?: string
    customer_address?: string
    delivered_at?: string
  } = { ...parsed.data }

  if (parsed.data.status === "delivered") {
    updatePayload.delivered_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("deliveries")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })

  if (parsed.data.status) {
    const admin = createAdminClient()
    await admin
      .channel(`rastreio:${id}`)
      .send({
        type: "broadcast",
        event: "status",
        payload: { status: parsed.data.status },
      })
      .catch(() => null)
  }

  return NextResponse.json(data)
}
