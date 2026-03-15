import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Provider from "@/components/provider"

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bluesh - AI-Powered Health Recommendations',
  description: 'Get personalized health insights powered by advanced AI. Predictive diagnostics, smart reminders, sleep tracking, and personalized exercise routines.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
       <Provider>{children}</Provider>
      
        </body>
    </html>
  )
}
