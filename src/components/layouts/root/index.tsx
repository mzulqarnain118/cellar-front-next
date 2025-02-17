/* eslint-disable */
import { ReactNode, useCallback, useEffect } from 'react'

import { useRouter } from 'next/router'

import { identify, isInitialized } from '@fullstory/browser'
import { closeAllModals, modals } from '@mantine/modals'
import { useSession } from 'next-auth/react'

import { LincChat } from '@/components/linc-chat'
import { Button } from '@/core/components/button'
import { useCuratedCartQuery } from '@/features/curated-cart/queries/curated-cart'
import { useSharedCartQuery } from '@/features/shared-cart/queries/shared-cart'
import { useVipCartQuery } from '@/features/vip-cart/queries/vip-cart'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { setTasting, useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useStatesQuery } from '@/lib/queries/state'

import { CheckoutLayout } from '../checkout'

import FormatDate from '@/components/formatDate'
import { useTastingEventStorage } from '@/lib/hooks/use-tasting-storage'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Footer } from './footer'
import { Header } from './header'
import POSSIBLE_PAGES from './main/possible-pages'
import { StatePicker } from './state-picker'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { ageVerified, setAgeVerified } = useAgeVerified()
  const router = useRouter()
  const [tastingStorage, setTastingStorage] = useTastingEventStorage()
  const searchParams = useSearchParams()
  let fullPath = null
  if (typeof window !== 'undefined') fullPath = window.location.href

  let url = typeof window !== 'undefined' && new URL(fullPath)
  let params = new URLSearchParams(url.search)

  const { eventshare, u } = router.query || { eventshare: null, u: null }
  const { data: session } = useSession()
  const selectedConsultantUrl = typeof window !== 'undefined' && localStorage.getItem('u')
  const { data: consultant } = useConsultantQuery()
  const { data: cart } = useCartQuery()
  const { isFetching: isFetchingStates, isLoading: isLoadingStates } = useStatesQuery()
  useCartQuery()
  useSharedCartQuery()
  useCuratedCartQuery()
  useVipCartQuery()

  async function tastingQuery() {
    const tastingResponse = await setTasting({
      cartId: cart?.id,
      consultantDisplayId: consultant.displayId,
      eventshare,
      consultantUrl: u,
    })
    setTastingStorage(tastingResponse)
  }
  useEffect(() => {
    if (cart?.id && consultant?.displayId && eventshare && u) {
      tastingQuery()
    }
  }, [cart?.id, consultant?.displayId, eventshare, u])

  useEffect(() => {
    const params = router?.asPath?.split('/?')
    if (params?.length > 1) {
      const path = router?.pathname === '/' ? `${router.pathname}/?${params?.[1]}` : params?.[0]
      router.replace(path)
    }
    if (router.isReady) {
      if (!router.query.u && !!selectedConsultantUrl) {
        router.query.u = selectedConsultantUrl
        router.replace(router)
      }

      if (searchParams.get('u') && searchParams.get('u') != selectedConsultantUrl) {
        localStorage.setItem('u', searchParams.get('u'))
      }
    }
  }, [searchParams.get('u'), router.isReady])

  const handleClick = useCallback(() => {
    setAgeVerified('true')
    modals.closeAll()
  }, [setAgeVerified])

  const pathname = router.asPath
  const rootPath = pathname.split('/')[1]

  useEffect(() => {
    const fetchConsultant = async () => {
      const baseApiUrl = process.env.NEXT_PUBLIC_TOWER_API_URL
      if (!POSSIBLE_PAGES.includes(rootPath.split('?')[0]) && router.isReady) {
        try {
          const consultantResponse = await fetch(`${baseApiUrl}/api/info/rep/${rootPath}`)

          if (consultantResponse.ok) {
            const consultant = await consultantResponse.json()
            if (consultant?.Url) {
              router.query.u = consultant.Url
              router.replace(router)
            }
          }
        } catch (error) {
          console.error('Error fetching consultant:', error)
        }
      }
    }

    fetchConsultant()
  }, [router.isReady])

  useEffect(() => {
    if (ageVerified === undefined || ageVerified === 'false') {
      modals.open({
        centered: true,
        children: (
          <div key="age-verified" className="space-y-2">
            {/* <Typography as="p" className="text-center mx-6 mb-4">
              Before you enter, we need to make sure you&apos;re of legal drinking age.
            </Typography> */}
            <StatePicker popup />
            <Button fullWidth disabled={isFetchingStates || isLoadingStates} onClick={handleClick}>
              Yes, I am 21 years of age or older
            </Button>
          </div>
        ),
        classNames: {
          header: 'flex justify-center mb-2',
          title: '!h4',
        },
        closeOnClickOutside: false,
        closeOnEscape: false,
        title: 'Are you 21 or older?',
        withCloseButton: false,
      })
    }
  }, [ageVerified, handleClick, isFetchingStates, isLoadingStates, setAgeVerified])

  useEffect(() => {
    const loginStatus = session

    if (!!u && !!eventshare && !!cart?.id && !!consultant?.displayId) {
      modals.open({
        centered: true,
        children: !!!tastingStorage?.Value.DisplayID ? (
          <div>
            <h4 className="pl-2 pb-4 border-b-2" key="tasting-event">
              Welcome
            </h4>
            <p className="pl-2 pt-4 text-4xl">Choose Your Wine</p>
            <p className="pl-2 py-4">
              Welcome! Unfortunately the event you are trying to shop under has ended. You can still
              shop on this site, but no special event credits will be earned.
            </p>
            <div className="text-right mt-4 pt-4 border-t-2">
              <Button className="cursor-pointer">
                <Link
                  className="text-inherit"
                  href={loginStatus ? WINE_PAGE_PATH : SIGN_IN_PAGE_PATH}
                  onClick={() => modals.closeAll()}
                >
                  {loginStatus ? 'Continue to shop' : 'Sign In'}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h5 className="pl-2 pb-4 border-b-2" key="tasting-event">
              Welcome
            </h5>
            <p className="pl-2 pt-4 text-3xl">
              Delicious <span className="text-rose-400">Clean-Crafted™</span> wines
            </p>
            <p className="pl-2 py-4 text-left text-xl font-semibold">
              Better in the <span className="text-rose-400">bottle</span>. Better in your{' '}
              <span className="text-rose-400">glass</span>. Better for the{' '}
              <span className="text-rose-400">planet</span>. We hope you enjoyed your Tasting!
            </p>
            <p>Event ID: {tastingStorage.Value.DisplayID}</p>
            <p>
              EventDate: <FormatDate dateString={tastingStorage.Value.EventDateTime} />
            </p>
            <div className="text-right mt-4 pt-4 border-t-2">
              <Button className="cursor-pointer" href="">
                <Link
                  className="text-inherit"
                  href={loginStatus ? WINE_PAGE_PATH : SIGN_IN_PAGE_PATH}
                  onClick={() => modals.closeAll()}
                >
                  {loginStatus ? 'Choose your wine' : 'Sign In'}
                </Link>
              </Button>
            </div>
          </div>
        ),
        classNames: {
          title: '!h4',
        },

        closeOnClickOutside: false,
        closeOnEscape: false,
        withCloseButton: true,
        size: 'xl',
      })
    }
  }, [router.query.u, router.query.eventshare, cart?.id, consultant?.displayId, tastingStorage])

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.u && consultant?.displayId !== CORPORATE_CONSULTANT_ID) {
        router.query.u = consultant?.url
        router.replace(router)
      }
    }
  }, [consultant?.displayId, consultant?.url, router, router.isReady])

  useEffect(() => {
    if (isInitialized() && !!session?.user) {
      // Tell FullStory who you are.
      identify(session.user.displayId, {
        displayName: `${session.user.name.first} ${session.user.name.last}`,
        email: session.user.email,
      })
    }
  }, [session?.user])

  useEffect(
    () => () => {
      closeAllModals()
      modals.closeAll()

      const body = document.getElementsByTagName('body')?.[0]
      body.style.overflow = 'visible'
    },
    []
  )

  return (
    <>
      <LincChat />
      {router.pathname === CHECKOUT_PAGE_PATH ? (
        <CheckoutLayout>{children}</CheckoutLayout>
      ) : (
        <div className="min-h-[100svh] grid" id="root-element">
          {/* ! TODO: Add skip link. */}
          {/* <SkipLink /> */}

          <Header />
          {children}
          <Footer />
        </div>
      )}
    </>
  )
}
