import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/sonner'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import ReactPlugin from '@stagewise-plugins/react'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cubcen - AI Agent Management Platform',
  description:
    'Centralized platform to manage, monitor, and orchestrate AI agents from various automation platforms',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
            <Toaster />
            <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
