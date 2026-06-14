/**
 * Tipos da integração com a iFood Merchant API.
 *
 * IMPORTANTE: os formatos abaixo seguem a estrutura pública documentada da
 * Merchant API do iFood, mas alguns nomes de campos precisam ser confirmados
 * contra a documentação viva no momento de habilitar a integração (procure por
 * "TODO: confirmar"). Tudo aqui só roda com IFOOD_ENABLED=true.
 */

/** Resposta do endpoint de autenticação OAuth (client credentials). */
export interface IfoodTokenResponse {
  accessToken: string
  type: string
  expiresIn: number
}

/**
 * Evento retornado pelo polling de eventos.
 * `fullCode` traz o nome legível (ex.: "PLACED", "CANCELLED", "CONCLUDED").
 */
export interface IfoodEvent {
  id: string
  code: string
  fullCode?: string
  orderId: string
  merchantId?: string
  createdAt?: string
}

/** Item enviado no acknowledgment (confirma que o evento foi processado). */
export interface IfoodAcknowledgment {
  id: string
}

/**
 * Detalhes de um pedido (subconjunto do que usamos).
 * TODO: confirmar o campo que distingue entrega própria (MERCHANT) de
 * entrega via logística iFood — em algumas versões é `delivery.mode`,
 * em outras `orderType`/`deliveryMethod`.
 */
export interface IfoodOrder {
  id: string
  merchantId?: string
  orderType?: string
  delivery?: {
    mode?: string
    deliveryAddress?: {
      formattedAddress?: string
      streetName?: string
      streetNumber?: string
      neighborhood?: string
      city?: string
    }
  }
  customer?: {
    name?: string
  }
}

/** Códigos de evento relevantes para o Rastreaí. */
export const IFOOD_EVENT = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  DISPATCHED: "DISPATCHED",
  CONCLUDED: "CONCLUDED",
  CANCELLED: "CANCELLED",
} as const

/** Indica entrega própria da loja (não logística do iFood). */
export const DELIVERY_MODE_MERCHANT = "MERCHANT"
