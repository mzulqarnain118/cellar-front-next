import {
  ChangeEventHandler,
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
} from 'react'

import { CheckboxProps, LoadingOverlay } from '@mantine/core'
import { useLockedBody } from 'usehooks-ts'

import { Link } from '@/components/link'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { formatCurrency } from '@/core/utils'
import { TERMS_AND_CONDITIONS_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutActions, useCheckoutErrors } from '@/lib/stores/checkout'

import { useCheckoutPayForOrderMutation } from '../../mutations/pay-for-order'

const checkboxClassNames: CheckboxProps['classNames'] = {
  error: 'text-14',
  label: 'text-14',
}

interface PayForOrderRefs {
  autoSipRef: MutableRefObject<HTMLInputElement | null>
  termsRef: MutableRefObject<HTMLInputElement | null>
  wineClubRef: MutableRefObject<HTMLInputElement | null>
}

interface PayForOrderProps {
  refs: PayForOrderRefs
  validate: () => Promise<boolean>
  cartTotalData: any
}

export const PayForOrder = ({ refs, validate, cartTotalData, handleValidateCart, validateCartStockResp }: PayForOrderProps) => {
  const { data: cart } = useCartQuery()
  const errors = useCheckoutErrors()
  const { setErrors } = useCheckoutActions()
  const { mutate: payForOrder, isLoading: isCheckingOut } = useCheckoutPayForOrderMutation(cartTotalData)
  const [locked, setLocked] = useLockedBody(false, '__next')
  const isDesktop = useIsDesktop()

  const isAutoSipCart = useMemo(() => cart?.items.some(item => item.isAutoSip), [cart?.items])
  const isScoutCircleCart = useMemo(
    () => cart?.items.some(item => item.isScoutCircleClub),
    [cart?.items]
  )

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      if (event.target.name) {
        setErrors(prev => ({ ...prev, [event.target.name]: '' }))
      }
    },
    [setErrors]
  )

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(async () => {
    handleValidateCart()

  }, [payForOrder, validate])

  useEffect(() => {
    setLocked(isCheckingOut)

    return () => {
      setLocked(false)
    }
  }, [isCheckingOut, setLocked])

  useEffect(() => {
    const functionCaller = async () => {
      const valid = await validate()

      if (valid) {
        payForOrder({})
      }
    }

    if (validateCartStockResp) {
      functionCaller()
    }
  }, [validateCartStockResp])

  return (
    <>
      <LoadingOverlay visible={locked} />
      <div className="space-y-8">
        <div className="mb-24 space-y-4">
          <Checkbox
            ref={refs.termsRef}
            classNames={checkboxClassNames}
            color="dark"
            error={errors?.terms}
            label={
              <>
                I have read and agree to the{' '}
                <Link
                  className="text-primary hover:underline"
                  href={TERMS_AND_CONDITIONS_PAGE_PATH}
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

          {isAutoSipCart ? (
            <Checkbox
              ref={refs.autoSipRef}
              classNames={checkboxClassNames}
              color="dark"
              error={errors?.autoSipTerms}
              label={
                <>
                  By clicking &quot;Place my order&quot; in checkout, I understand that I am
                  enrolling in the Auto-Sip™ program and agree to the Terms & Conditions*
                </>
              }
              name="autoSipTerms"
              onChange={handleChange}
            />
          ) : undefined}
          {isScoutCircleCart ? (
            <Checkbox
              ref={refs.wineClubRef}
              classNames={checkboxClassNames}
              color="dark"
              error={errors?.wineClubTerms}
              label={
                <>
                  By joining the Wine Club, I agree to my first Wine Club purchase on the above
                  selected date and then upon future shipments based on the selected frequency,
                  unless I change or cancel my Club Membership. Terms & Conditions*
                </>
              }
              name="wineClubTerms"
              onChange={handleChange}
            />
          ) : undefined}
        </div>
        <div className="fixed bottom-0 flex w-[stretch] items-center border-t border-t-neutral bg-[#f7f3f4] py-4 pr-4 lg:w-[50svw]">
          <div className="grid">
            <Typography className="text-neutral-600">TOTAL</Typography>
            <Typography className="text-2xl font-bold">
              {cartTotalData?.orderTotal ? formatCurrency(cartTotalData?.orderTotal) : '$--.--'}
            </Typography>
          </div>
          <div className="ml-auto">
            <Button size={isDesktop ? 'lg' : 'md'} onClick={handleSubmit}>
              Place my order
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
