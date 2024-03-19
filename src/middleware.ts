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
  'eventshare',
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
const appUrl = process.env.NEXT_PUBLIC_APP_URL

export const middleware = async (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl

  // Check if the URL matches the pattern /eventshare/:dynamicValue
  const match = pathname.match(/^\/eventshare\/([^/]+)/)
  const rootPath = pathname.split('/')[1]

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
  } else if (match) {
    const dynamicValue = match[1]
    const u = searchParams.get('u')
    // Construct an absolute URL for the redirection
    const redirectUrl = `${appUrl}/?u=${u}&eventshare=${dynamicValue}`

    return NextResponse.redirect(`${redirectUrl}`)
  }
}
