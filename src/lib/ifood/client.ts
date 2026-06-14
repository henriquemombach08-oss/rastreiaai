import type {
  IfoodTokenResponse,
  IfoodEvent,
  IfoodAcknowledgment,
  IfoodOrder,
} from "./types"

/**
 * Cliente da iFood Merchant API.
 *
 * Modelo de integração (polling):
 *  1. Autentica via OAuth client credentials e cacheia o token.
 *  2. Faz polling de eventos (GET .../events:polling).
 *  3. Para cada pedido relevante, busca os detalhes (GET .../orders/{id}).
 *  4. Confirma os eventos processados (POST .../events/acknowledgment).
 *
 * Endpoints ficam como constantes para facilitar ajuste sem caçar pelo código.
 * Só deve ser instanciado quando IFOOD_ENABLED=true.
 */

const IFOOD_BASE_URL =
  process.env.IFOOD_BASE_URL ?? "https://merchant-api.ifood.com.br"

const ENDPOINTS = {
  token: `${IFOOD_BASE_URL}/authentication/v1.0/oauth/token`,
  polling: `${IFOOD_BASE_URL}/events/v1.0/events:polling`,
  acknowledgment: `${IFOOD_BASE_URL}/events/v1.0/events/acknowledgment`,
  order: (orderId: string) =>
    `${IFOOD_BASE_URL}/order/v1.0/orders/${orderId}`,
} as const

interface CachedToken {
  accessToken: string
  expiresAt: number // epoch ms
}

// Cache simples em memória do processo. Em serverless pode reautenticar com
// frequência, o que é aceitável; para escala, mover para um store compartilhado.
let tokenCache: CachedToken | null = null

function getCredentials() {
  const clientId = process.env.IFOOD_CLIENT_ID
  const clientSecret = process.env.IFOOD_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do iFood não configuradas (IFOOD_CLIENT_ID / IFOOD_CLIENT_SECRET)")
  }
  return { clientId, clientSecret }
}

/** Obtém um token de acesso válido, reutilizando o cache enquanto não expira. */
export async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken
  }

  const { clientId, clientSecret } = getCredentials()

  const body = new URLSearchParams({
    grantType: "client_credentials",
    clientId,
    clientSecret,
  })

  const res = await fetch(ENDPOINTS.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error(`Falha ao autenticar no iFood: ${res.status}`)
  }

  const data = (await res.json()) as IfoodTokenResponse
  tokenCache = {
    accessToken: data.accessToken,
    expiresAt: Date.now() + data.expiresIn * 1000,
  }
  return data.accessToken
}

/** Consulta a fila de eventos. Retorna [] quando não há nada (HTTP 204). */
export async function pollEvents(): Promise<IfoodEvent[]> {
  const token = await getAccessToken()

  const res = await fetch(ENDPOINTS.polling, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 204) return []
  if (!res.ok) {
    throw new Error(`Falha no polling de eventos do iFood: ${res.status}`)
  }

  return (await res.json()) as IfoodEvent[]
}

/** Confirma que os eventos foram processados (remove-os da fila do iFood). */
export async function acknowledgeEvents(
  events: IfoodAcknowledgment[]
): Promise<void> {
  if (events.length === 0) return

  const token = await getAccessToken()

  const res = await fetch(ENDPOINTS.acknowledgment, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(events),
  })

  if (!res.ok) {
    throw new Error(`Falha no acknowledgment do iFood: ${res.status}`)
  }
}

/** Busca os detalhes completos de um pedido. */
export async function getOrder(orderId: string): Promise<IfoodOrder> {
  const token = await getAccessToken()

  const res = await fetch(ENDPOINTS.order(orderId), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`Falha ao buscar pedido ${orderId} no iFood: ${res.status}`)
  }

  return (await res.json()) as IfoodOrder
}
