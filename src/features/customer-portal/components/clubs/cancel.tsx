import { useCallback, useEffect, useMemo } from 'react'

import { useRouter } from 'next/router'
import Script from 'next/script'

import { showNotification } from '@mantine/notifications'
import { useSession } from 'next-auth/react'

import { Link } from '@/components/link'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { MY_ACCOUNT_PAGE_PATH } from '@/lib/paths'

import { useSkipSubscriptionMutation } from '../../mutations/skip-subscription'
import { ChargebeeData } from '../../queries/chargebee'

interface CancelProps {
  chargebeeData?: ChargebeeData
  handleHide: () => void
  refetch: () => void
  skipNext?: boolean
  subscriptionId: number
}

export const Cancel = ({
  chargebeeData: customChargebeeData,
  handleHide,
  refetch,
  skipNext = false,
  subscriptionId,
}: CancelProps) => {
  const router = useRouter()

  const {
    mutate: skipSubscription,
    isLoading: skipping,
    isSuccess: skipped,
  } = useSkipSubscriptionMutation()
  const { data: session } = useSession()

  const chargebeeData = useMemo(
    () =>
      customChargebeeData === undefined
        ? undefined
        : {
            account: {
              internal_id: customChargebeeData.CustomerDisplayId,
            },
            app_id: process.env.NEXT_PUBLIC_CHARGEBEE_APP_ID,
            cancel_confirmation_url: typeof window !== undefined ? window.location.href : '',
            custom: {
              a_la_carte_orders: customChargebeeData.AlaCarteOrders365,
              action_type: 'cancel',
              bottle_count: customChargebeeData.BottleCount,
              consultant_display_id: customChargebeeData.SponsorDisplayId,
              consultant_first_name: customChargebeeData.SponsorFirstName,
              consultant_full_name: `${customChargebeeData.SponsorFirstName} ${customChargebeeData.SponsorLastName}`,
              consultant_last_name: customChargebeeData.SponsorLastName,
              frequency: customChargebeeData.Frequency,
              last_shipped_date: customChargebeeData.LastShippedDate,
              number_of_active_subscriptions: customChargebeeData.NumActiveSubscriptions,
              number_of_paused_subscriptions: customChargebeeData.NumPausedSubscriptions,
              product_description: customChargebeeData.ProductDescription,
              scout_rewards: customChargebeeData.ScoutRewards,
              ship_to_state: customChargebeeData.ShipToState,
              sku: customChargebeeData.SKU,
              subscription_create_date: customChargebeeData.SubscriptionCreateDate,
              varietal_type: customChargebeeData.VarietalType,
            },
            email: session?.user?.email || '',
            first_name: customChargebeeData.CustomerFirstName,
            full_name: `${customChargebeeData.CustomerFirstName} ${customChargebeeData.CustomerLastName}`,
            last_name: session?.user?.name.last || '',
            save_return_url: typeof window !== undefined ? window.location.href : '',
            subscription_id: subscriptionId,
          },
    [customChargebeeData, session?.user?.email, session?.user?.name.last, subscriptionId]
  )

  const chargebeeScript = useMemo(
    () =>
      chargebeeData === undefined ? undefined : (
        <Script id={subscriptionId.toString()}>{`
          if (window.Brightback) {
            const response = window.Brightback.handleDataPromise(${JSON.stringify(chargebeeData)});
            response.then(data => {
              if (data.valid) {
                window.open(data.url, '_self');
              }
            });
          }
        `}</Script>
      ),
    [chargebeeData, subscriptionId]
  )

  const handleSkip = useCallback(() => {
    skipSubscription(subscriptionId)
  }, [skipSubscription, subscriptionId])

  useEffect(() => {
    if (skipped && !skipping) {
      showNotification({ message: 'Thank you! Your next subscription shipment will be skipped.' })
      router.push(`${MY_ACCOUNT_PAGE_PATH}/clubs/${subscriptionId}`)
    }
  }, [handleHide, refetch, router, skipped, skipping, subscriptionId])

  return (
    <>
      {!skipNext ? chargebeeScript : undefined}
      {skipNext && !skipped ? (
        <Typography as="h1" displayAs="h4">
          Are you sure you want to skip your next shipment?
        </Typography>
      ) : undefined}
      {skipped ? undefined : (
        <Link
          className="invisible"
          href={typeof window !== undefined ? window.location.href : ''}
          id="bb-cancel"
        >
          Cancel
        </Link>
      )}
      {!skipNext ? (
        <Typography>Loading...</Typography>
      ) : skipped ? (
        <div className="grid pb-10 pt-0 text-center">
          <Typography className="text-2xl font-bold text-[#854f50]">Thank you!</Typography>
          <Typography>Your next subscription shipment will be skipped.</Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <Button color="ghost" disabled={skipping} onClick={handleHide}>
            Never mind
          </Button>
          <Button disabled={skipping} onClick={handleSkip}>
            Skip my next shipment
          </Button>
        </div>
      )}
    </>
  )
}
