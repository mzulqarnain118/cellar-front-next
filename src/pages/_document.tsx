import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <div id="cart-drawer" />
        <div id="mobile-menu-drawer" />
      </body>
    </Html>
  )
}
