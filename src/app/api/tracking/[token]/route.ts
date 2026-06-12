import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const tipo = req.nextUrl.searchParams.get("tipo") // "courier" | "customer"

  if (!tipo || (tipo !== "courier" && tipo !== "customer")) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  const admin = createAdminClient()

  const campo = tipo === "courier" ? "courier_token" : "customer_token"

  const { data: delivery, error } = await admin
    .from("deliveries")
    .select("id, customer_name, customer_address, status, store_id, dispatched_at, created_at")
    .eq(campo, token)
    .single()

  if (error || !delivery) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 404 })
  }

  // Busca nome da loja
  const { data: store } = await admin
    .from("stores")
    .select("name")
    .eq("id", delivery.store_id)
    .single()

  return NextResponse.json({
    id: delivery.id,
    customer_name: delivery.customer_name,
    customer_address: delivery.customer_address,
    status: delivery.status,
    store_name: store?.name ?? "Loja",
    dispatched_at: delivery.dispatched_at,
    created_at: delivery.created_at,
  })
}
