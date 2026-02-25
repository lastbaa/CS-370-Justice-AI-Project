import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Justice AI — Secure Legal Research for Professionals',
  description:
    'Justice AI runs entirely on your machine. No data sent externally. Citation-first answers grounded in your documents — built for legal professionals who cannot afford confidentiality risks.',
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
      'Runs entirely on your machine. No data sent externally. Citation-first answers grounded in your documents.',
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
