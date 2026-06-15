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
    pending: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    dispatched: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    nearby: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    delivered: "bg-green-500/15 text-green-400 border border-green-500/20",
    canceled: "bg-red-500/15 text-red-400 border border-red-500/20",
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
