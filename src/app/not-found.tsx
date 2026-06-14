import Link from "next/link"
import { MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand rounded-2xl p-4 mb-6 inline-flex">
        <MapPin className="h-8 w-8 text-white" />
      </div>
      <p className="text-6xl font-bold text-neutral-200 mb-3">404</p>
      <h1 className="text-xl font-semibold text-neutral-800 mb-2">Página não encontrada</h1>
      <p className="text-neutral-500 mb-8 max-w-xs">
        O link que você acessou não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
