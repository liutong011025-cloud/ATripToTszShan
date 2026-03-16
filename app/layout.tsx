import type { Metadata } from 'next'
import { Geist, Geist_Mono, Caveat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _caveat = Caveat({ subsets: ["latin"], variable: "--font-handwriting" });

export const metadata: Metadata = {
  title: 'A Trip To TSZ SHAN MONASTERY',
  description: 'Share your journey and reflections from Tsz Shan Monastery',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/logo.png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_caveat.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
