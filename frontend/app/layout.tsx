import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WhatsApp Manager",
  description: "Administrador de grupos y canales de WhatsApp",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <Header />

              {/* Page Content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
