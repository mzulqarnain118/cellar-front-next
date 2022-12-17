import { Inter, Montserrat } from '@next/font/google'

import { Header } from '../src/components/header'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html className={`${inter.variable} ${montserrat.variable}`} lang="en">
    <head />
    <body>
      <Header />
      {children}
    </body>
  </html>
)

export default RootLayout
