import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { locationSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  const concluir = req.nextUrl.searchParams.get("concluir") === "true"

  if (!token) {
    return NextResponse.json({ error: "Token obrigatório" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: delivery, error: findError } = await admin
    .from("deliveries")
    .select("id, status")
    .eq("courier_token", token)
    .single()

  if (findError || !delivery) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 })
  }

  if (delivery.status === "delivered" || delivery.status === "canceled") {
    return NextResponse.json({ error: "Entrega encerrada" }, { status: 409 })
  }

  if (concluir) {
    await admin
      .from("deliveries")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", delivery.id)

    await admin
      .channel(`rastreio:${delivery.id}`)
      .send({
        type: "broadcast",
        event: "status",
        payload: { status: "delivered" },
      })
      .catch(() => null)

    return NextResponse.json({ ok: true })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  const parsed = locationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 })
  }

  const { lat, lng, accuracy } = parsed.data

  await admin.from("delivery_locations").insert({
    delivery_id: delivery.id,
    lat,
    lng,
    accuracy: accuracy ?? null,
  })

  await admin
    .channel(`rastreio:${delivery.id}`)
    .send({
      type: "broadcast",
      event: "location",
      payload: { lat, lng, accuracy },
    })
    .catch(() => null)

  return NextResponse.json({ ok: true })
}
