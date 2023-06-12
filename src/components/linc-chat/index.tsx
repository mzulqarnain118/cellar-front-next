import { useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { useCartQuery } from '@/lib/queries/cart'
import { useCartOpen } from '@/lib/stores/process'

import { SHA256 } from './utils'

export const LincChat = () => {
  const { data: session } = useSession()
  const { data: cart } = useCartQuery()
  const { cartOpen: isCartOpened } = useCartOpen()
  const { ageVerified: isAgeVerified } = useAgeVerified()
  const isDesktop = useIsDesktop()
  const pageCategory = 'PDP'

  const [isLincInitialized, setIsLincInitialized] = useState(false)

  const email = useMemo(() => session?.user?.email, [session?.user?.email])
  const emailHash = useMemo(
    () =>
      email
        ? SHA256(`${email.toLowerCase()}${process.env.NEXT_PUBLIC_LINC_HASH_KEY || ''}`)
        : undefined,
    [email]
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;((d, s, id) => {
      let js = d.getElementsByTagName(s)[0] as HTMLScriptElement
      const ljs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      // @ts-ignore
      js = d.createElement(s)
      js.id = id
      js.src = `//connect.letslinc.com/v1/webChat.js`
      ljs.parentNode?.insertBefore(js, ljs)
    })(document, 'script', 'linc-web-chat-js')

    window.lincWebChatAsyncInit = () => {
      LincWebChat.init({
        locale: 'en-US',
        pageContext: {
          pageCategory: isCartOpened ? 'Cart' : pageCategory,
          productsInfo: isCartOpened ? cart?.items : [],
        },
        publicId: '6e17cd1a-e673-11eb-8940-4ec5dd03e061',
        shopperEmail: email || '',
        shopperEmailHash: emailHash || '',
      })
      setIsLincInitialized(true)
    }
  }, [cart?.items, email, emailHash, isCartOpened])

  useEffect(() => {
    if (
      window?.LincWebChat &&
      isAgeVerified &&
      isLincInitialized &&
      !(!isDesktop && pageCategory === 'PDP')
    ) {
      window.LincWebChat.reload({
        locale: 'en-US',
        pageContext: {
          pageCategory: isCartOpened ? 'Cart' : pageCategory,
          productsInfo: isCartOpened ? cart?.items : [],
        },
        publicId: '6e17cd1a-e673-11eb-8940-4ec5dd03e061',
        shopperEmail: email || '',
        shopperEmailHash: emailHash || '',
      })
    }
  }, [cart?.items, email, emailHash, isAgeVerified, isCartOpened, isDesktop, isLincInitialized])

  return <></>
}
