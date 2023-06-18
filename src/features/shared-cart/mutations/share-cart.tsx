import { useClipboard } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { api } from '@/lib/api'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { toastLoading, toastSuccess } from '@/lib/utils/notifications'

import { SaveSharedCartResponse } from '../types'

interface ShareCartOptions {
  cartId: string
  consultantUrl?: string
}

export const shareCart = async ({ cartId, consultantUrl }: ShareCartOptions) => {
  try {
    const response = await api('SaveSharedCart', {
      json: {
        CartId: cartId,
        ConsultantPURL: consultantUrl,
      },
      method: 'post',
    }).json<SaveSharedCartResponse>()

    return response
  } catch {
    throw new Error('There was an error sharing the cart.')
  }
}

const clipboardProps = { timeout: 2000 }

export const useShareCartMutation = () => {
  const { data: cart } = useCartQuery()
  const { data: consultant } = useConsultantQuery()
  const clipboard = useClipboard(clipboardProps)

  return useMutation({
    mutationFn: () =>
      shareCart({
        cartId: cart?.id || '',
        consultantUrl:
          consultant?.displayId === CORPORATE_CONSULTANT_ID ? undefined : consultant.url,
      }),
    onMutate: () => {
      toastLoading({ message: 'Sharing your cart...' })
    },
    onSuccess: data => {
      if (data?.Success) {
        notifications.clean()
        toastSuccess({ message: 'Created a shared cart successfully!' })
        modals.open({
          centered: true,
          children: (
            <div className="space-y-4 text-14">
              <Typography as="p">
                Introduce your friends and family to the Clean-Crafted™ products you love. Simply
                click on the COPY link below, then PASTE the link pretty much anywhere, from emails
                and texts to social posts!
              </Typography>
              <Typography as="p" className="italic">
                The product(s) you are sharing must be available to purchase and must be shippable
                to the state where your audience resides.
              </Typography>

              <Input
                noSpacing
                readOnly
                name="promoCode"
                right={
                  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                  <Button
                    dark
                    className="h-10 rounded-l-none"
                    size="sm"
                    type="button"
                    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                    onClick={() => {
                      clipboard.copy(data.ShortLinkUrl)
                      toastSuccess({ message: 'Share the love!', title: 'Shared cart link copied' })
                    }}
                  >
                    Copy
                  </Button>
                }
                size="sm"
                value={data.ShortLinkUrl}
              />
            </div>
          ),
          title: 'Share the love!',
        })
      }
    },
  })
}
