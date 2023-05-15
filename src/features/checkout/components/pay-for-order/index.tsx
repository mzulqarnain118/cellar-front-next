import { ChangeEventHandler, MouseEventHandler, MutableRefObject, useCallback } from 'react'

import { Link } from '@/components/link'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useCheckoutActions, useCheckoutErrors } from '@/lib/stores/checkout'

import { useCheckoutPayForOrderMutation } from '../../mutations/pay-for-order'

interface PayForOrderRefs {
  autoSipRef: MutableRefObject<HTMLInputElement | null>
  termsRef: MutableRefObject<HTMLInputElement | null>
  wineClubRef: MutableRefObject<HTMLInputElement | null>
}

interface PayForOrderProps {
  refs: PayForOrderRefs
  validate: () => Promise<boolean>
}

export const PayForOrder = ({ refs, validate }: PayForOrderProps) => {
  const errors = useCheckoutErrors()
  const { data: totalData } = useGetSubtotalQuery()
  const { setErrors } = useCheckoutActions()
  const { mutate: payForOrder } = useCheckoutPayForOrderMutation()

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      if (event.target.name) {
        setErrors(prev => ({ ...prev, [event.target.name]: '' }))
      }
    },
    [setErrors]
  )

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(async () => {
    const valid = await validate()

    if (valid) {
      payForOrder({})
    }
  }, [payForOrder, validate])

  return (
    <div className="space-y-8">
      <div className="mb-24 space-y-4">
        <Checkbox
          ref={refs.termsRef}
          color="dark"
          error={errors?.terms}
          label={
            <>
              I have read and agree to the{' '}
              <Link
                className="text-primary hover:underline"
                href="/terms-and-conditions"
                target="_blank"
              >
                Terms of Use
              </Link>
              *
            </>
          }
          name="terms"
          onChange={handleChange}
        />
        <Checkbox
          ref={refs.autoSipRef}
          color="dark"
          error={errors?.autoSipTerms}
          label={
            <>
              By clicking &quot;Place my order&quot; in checkout, I understand that I am enrolling
              in the Auto-Sip™ program and agree to the Terms & Conditions*
            </>
          }
          name="autoSipTerms"
          onChange={handleChange}
        />
        <Checkbox
          ref={refs.wineClubRef}
          color="dark"
          error={errors?.wineClubTerms}
          label={
            <>
              By joining the Wine Club, I agree to my first Wine Club purchase on the above selected
              date and then upon future shipments based on the selected frequency, unless I change
              or cancel my Club Membership. Terms & Conditions*
            </>
          }
          name="wineClubTerms"
          onChange={handleChange}
        />
      </div>
      <div className="fixed bottom-0 flex w-[stretch] items-center border-t border-t-neutral bg-[#f7f3f4] py-4 pr-4 lg:w-[calc(50%-9.25rem)] lg:pr-0">
        <div className="grid">
          <Typography className="text-neutral-600">TOTAL</Typography>
          <Typography className="text-2xl font-bold">
            {totalData?.orderTotal ? formatCurrency(totalData?.orderTotal) : '$--.--'}
          </Typography>
        </div>
        <div className="ml-auto">
          <Button size="lg" onClick={handleSubmit}>
            Place my order
          </Button>
        </div>
      </div>
    </div>
  )
}
