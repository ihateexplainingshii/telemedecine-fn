import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/providers/Providers"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Telemedicine Rwanda - Quality Healthcare at Your Fingertips",
  description:
    "Access quality healthcare services remotely in Rwanda. Book appointments, consult with doctors, and manage your health online.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--color-card))",
                color: "hsl(var(--color-foreground))",
                border: "1px solid hsl(var(--color-border))",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "white",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
