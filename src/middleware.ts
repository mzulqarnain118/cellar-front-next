import { NextResponse, type NextRequest } from 'next/server'

import { ConsultantResponse } from './lib/queries/consultant'

// ! TODO: This solution is not scalable.
export const POSSIBLE_PAGES = [
  '',
  '_next',
  '404',
  'api',
  'brands',
  'checkout',
  'checkout-confirmation',
  'coffee',
  'consultants',
  'create-account',
  'favicon.ico',
  'forgot-password',
  'growers',
  'guest-checkout',
  'logo.svg',
  'merch',
  'my-account',
  'our-growers',
  'press',
  'product',
  'search',
  'sign-in',
  'white-logo.svg',
  'wine',
  'winelist',
]

const baseApiUrl = process.env.NEXT_PUBLIC_TOWER_API_URL

export const middleware = async (request: NextRequest) => {
  const rootPath = request.nextUrl.pathname.split('/')[1]

  if (!POSSIBLE_PAGES.includes(rootPath)) {
    const consultantResponse = await fetch(`${baseApiUrl}/api/info/rep/${rootPath}`)

    if (consultantResponse?.ok) {
      const consultant = (await consultantResponse.json()) as ConsultantResponse

      if (consultant.DisplayID) {
        const url = new URL('/', request.url)
        url.searchParams.set('u', consultant.Url)

        return NextResponse.redirect(url)
      }
    }
  }
}
