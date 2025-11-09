import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'

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
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}