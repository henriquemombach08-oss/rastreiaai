import type { Metadata, Viewport } from "next"
import { Syne } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rastreaí — Rastreamento de entregas próprias",
  description: "Rastreamento em tempo real para restaurantes com entrega própria no iFood",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rastreaí",
  },
}

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${syne.className} h-full antialiased`}>{children}</body>
    </html>
  )
}
