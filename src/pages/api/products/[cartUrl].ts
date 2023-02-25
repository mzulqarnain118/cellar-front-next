import type { NextRequest } from 'next/server'

import { ProductsResponse } from '@/lib/types/schemas/product'

export const config = {
  runtime: 'edge',
}

const getURLParam = (req: NextRequest): string =>
  new URL(req.url).pathname.replace(/\/+$/, '').split('/').slice(-1)[0]

const handler = async (req: NextRequest) => {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: {
          message: `Method "${req.method}" is not allowed.`,
        },
        success: false,
      }),
      {
        headers: {
          Allow: 'GET',
        },
        status: 405, // * Method not allowed.
      }
    )
  }

  try {
    const cartUrl = getURLParam(req)
    if (!cartUrl?.toString()) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'cartUrl is required',
            success: false,
          },
        }),
        { status: 400 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)

    if (response.ok) {
      const data = (await response.json()) as ProductsResponse

      if (data.success) {
        const product = data.data.find(item => item.cartUrl === cartUrl?.toString())

        if (product !== undefined) {
          return new Response(
            JSON.stringify({
              data: product,
              success: true,
            }),
            { status: 200 }
          )
        }

        return new Response(
          JSON.stringify({
            error: { message: `The product with cartUrl: ${cartUrl}, could not be found` },
            success: false,
          }),
          { status: 404 }
        )
      }
    }

    // ! TODO: Log into Sentry.
    return new Response(
      JSON.stringify({
        error: { message: 'There was an error fetching the products.' },
        success: false,
      }),
      { status: 500 }
    )
  } catch {
    // ! TODO: Log into Sentry.
    return new Response(
      JSON.stringify({
        error: { message: 'There was an error fetching the products.' },
        success: false,
      }),
      { status: 500 }
    )
  }
}

export default handler
