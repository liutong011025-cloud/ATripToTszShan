import type { Metadata } from 'next'
import { Geist, Geist_Mono, Caveat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import ClickSpark from '@/components/click-spark'
import type { ReactNode } from 'react'
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
        url: '/logo.png',
      },
    ],
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_caveat.variable}`}>
        <ClickSpark
          sparkColor="#fff"
          sparkSize={23}
          sparkRadius={30}
          sparkCount={11}
          duration={400}
        >
          {children}
        </ClickSpark>
        <Analytics />
      </body>
    </html>
  )
}
