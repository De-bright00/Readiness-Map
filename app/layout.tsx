import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'PHC Readiness Map | Nigeria',
  description: 'A clearer picture of where primary healthcare is actually available across FCT, Lagos and Kano.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-[#f7f6f1]"><body className={`${fraunces.variable} ${inter.variable}`}>{children}</body></html>
}
