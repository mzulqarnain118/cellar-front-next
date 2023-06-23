import { useMemo } from 'react'

import { Tabs, TabsPanelProps } from '@mantine/core'

import { useSubscriptionsQuery } from '../../queries/subscriptions'

import { Subscription } from './subscription'

export const Clubs = ({ autoSip = false, ...props }: TabsPanelProps & { autoSip?: boolean }) => {
  const { data: subscriptions } = useSubscriptionsQuery(autoSip ? 'AutoShip' : 'Club-Subscription')

  const clubs = useMemo(
    () => (
      <div className="space-y-8">
        {!!subscriptions &&
          subscriptions.map(subscription => (
            <Subscription key={subscription.SubscriptionID} autoSip={autoSip} data={subscription} />
          ))}
      </div>
    ),
    [autoSip, subscriptions]
  )

  return <Tabs.Panel {...props}>{clubs}</Tabs.Panel>
}
