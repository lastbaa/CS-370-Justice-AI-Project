import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  icons: { icon: '/favicon.svg', apple: '/favicon.png' },
  title: 'Justice AI — Secure Legal Research for Professionals',
  description:
    'Justice AI keeps your documents on your machine. Citation-first answers grounded in your files — built for legal professionals who cannot afford confidentiality risks.',
  keywords: [
    'legal AI',
    'attorney client privilege',
    'private AI',
    'legal research tool',
    'local AI',
    'confidential legal software',
    'document analysis',
    'law practice technology',
  ],
  openGraph: {
    title: 'Justice AI — Secure Legal Research for Professionals',
    description:
      'Your documents stay on your machine. Citation-first answers grounded in your files — private by design.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-navy text-white antialiased">{children}</body>
    </html>
  )
}
