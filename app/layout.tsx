import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { AuthGuard } from "@/components/auth/auth-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PerformePLUS - Gestion Performance Sportive",
  description: "Plateforme de gestion et d'analyse de la performance sportive",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}