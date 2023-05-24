import { useMemo } from 'react'

import { Tabs, TabsPanelProps } from '@mantine/core'

import { useSubscriptionsQuery } from '../../queries/subscriptions'

import { Subscription } from './subscription'

export const Clubs = (props: TabsPanelProps) => {
  const { data: subscriptions } = useSubscriptionsQuery('Club-Subscription')

  const clubs = useMemo(
    () => (
      <div className="space-y-8">
        {subscriptions?.map(subscription => (
          <Subscription key={subscription.SubscriptionID} data={subscription} />
        ))}
      </div>
    ),
    [subscriptions]
  )

  return <Tabs.Panel {...props}>{clubs}</Tabs.Panel>
}
