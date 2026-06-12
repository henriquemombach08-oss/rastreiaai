import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DeliveryStatus } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    pending: "Aguardando",
    dispatched: "A caminho",
    nearby: "Perto",
    delivered: "Entregue",
    canceled: "Cancelado",
  }
  return labels[status]
}

export function statusColor(status: DeliveryStatus): string {
  const colors: Record<DeliveryStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    dispatched: "bg-blue-100 text-blue-800",
    nearby: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  }
  return colors[status]
}

export function tempoDecorrido(desde: string): string {
  const diff = Date.now() - new Date(desde).getTime()
  const minutos = Math.floor(diff / 60000)
  if (minutos < 1) return "agora mesmo"
  if (minutos < 60) return `${minutos} min atrás`
  const horas = Math.floor(minutos / 60)
  return `${horas}h${minutos % 60}min atrás`
}

export function formatarEndereco(endereco: string): string {
  return endereco.length > 60 ? endereco.slice(0, 57) + "..." : endereco
}
