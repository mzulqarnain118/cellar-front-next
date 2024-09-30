import { LoadingOverlay, Tabs, TabsPanelProps } from '@mantine/core'
import { Link } from 'react-daisyui'

import { useSubscriptionsQuery } from '../../queries/subscriptions'

import { Subscription } from './subscription'

export const Clubs = ({ autoSip = false, ...props }: TabsPanelProps & { autoSip?: boolean }) => {
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptionsQuery(
    autoSip ? 'AutoShip' : 'Club-Subscription'
  )

  const filteredSubscriptions =
    (subscriptions?.result !== false && subscriptions?.filter(item => item.Enabled)) || []

  const clubs = () => {
    if (filteredSubscriptions?.length === 0 && !autoSip) {
      return <h1 className="text-[#cac5c5] mt-[100px] text-center">No Active Memberships</h1>
    } else if (filteredSubscriptions?.length === 0 && autoSip) {
      return (
        <div className="mt-[100px] text-center">
          <h5>No active Circle Choice subscriptions.</h5>
          <p>
            To sign up for a Circle Choice subscription, <Link href="/circle-choice-test-1">click here</Link>.
          </p>
        </div>
      )
    } else {
      return filteredSubscriptions?.map(subscription => (
        <Subscription key={subscription.SubscriptionID} autoSip={autoSip} data={subscription} />
      ))
    }
  }

  return (
    <>
      <LoadingOverlay visible={subscriptionsLoading} />
      <Tabs.Panel {...props}>
        <div className="space-y-8">{clubs()}</div>
      </Tabs.Panel>
    </>
  )
}
