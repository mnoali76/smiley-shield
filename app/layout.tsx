import type { Metadata } from 'next'
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-calender-green.vercel.app'),
  title: 'Smiley Shield — הסתרת פנים בתמונות',
  description: 'מסתירים פנים בתמונות בקלות, במהירות ובצורה בטוחה. מתאים לגננות, מורים וצוותי חינוך. העיבוד מתבצע בדפדפן שלך בלבד — ללא שמירה בשרת.',
  openGraph: {
    title: 'Smiley Shield — הסתרת פנים בתמונות',
    description: 'מסתירים פנים בתמונות בקלות ובבטחה. מתאים לגננות, מורים וצוותי חינוך.',
    url: 'https://ai-calender-green.vercel.app',
    siteName: 'Smiley Shield',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
