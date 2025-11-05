import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shorts Studio - AI Content Planning for YouTube Shorts',
  description: 'Plan, script, and optimize your YouTube Shorts content with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}