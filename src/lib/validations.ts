import { z } from "zod"

export const novaEntregaSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(120, "Nome muito longo"),
  customer_address: z
    .string()
    .min(5, "Endereço deve ter ao menos 5 caracteres")
    .max(300, "Endereço muito longo"),
  ifood_order_id: z.string().optional(),
})

export type NovaEntregaInput = z.infer<typeof novaEntregaSchema>

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
})

export type LocationInput = z.infer<typeof locationSchema>

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const cadastroLojaSchema = z.object({
  name: z.string().min(2, "Nome da loja deve ter ao menos 2 caracteres").max(80),
})

export type CadastroLojaInput = z.infer<typeof cadastroLojaSchema>
