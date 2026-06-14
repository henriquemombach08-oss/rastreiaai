import crypto from "node:crypto"

/**
 * Valida a assinatura de um webhook do iFood.
 *
 * Calcula o HMAC-SHA256 do corpo bruto usando o secret e compara, em tempo
 * constante, com a assinatura recebida no header.
 *
 * TODO: confirmar na doc viva do iFood o algoritmo exato e a string canônica
 * assinada (alguns provedores assinam `timestamp.body`, não só o body).
 */
export function validarAssinaturaWebhook(
  rawBody: string,
  assinatura: string,
  secret: string
): boolean {
  const esperado = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")

  const a = Buffer.from(assinatura)
  const b = Buffer.from(esperado)

  // timingSafeEqual exige buffers do mesmo tamanho.
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
