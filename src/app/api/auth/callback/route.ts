import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/dashboard"
  const error = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")

  if (error) {
    const msg = errorDescription ?? error
    return NextResponse.redirect(
      `${url.origin}/login?erro=${encodeURIComponent(msg)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: troca } = await supabase.auth.exchangeCodeForSession(code)
    if (!troca) {
      return NextResponse.redirect(`${url.origin}${next}`)
    }
  }

  return NextResponse.redirect(`${url.origin}/login`)
}
