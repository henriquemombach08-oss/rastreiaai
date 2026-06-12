import { customAlphabet } from "nanoid"

// Alfabeto URL-safe sem caracteres ambíguos (0/O, 1/I/l)
const nanoid = customAlphabet(
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  48
)

export function gerarToken(): string {
  return nanoid()
}
