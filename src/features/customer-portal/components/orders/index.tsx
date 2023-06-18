import { useMemo } from 'react'

import { Tabs, TabsPanelProps } from '@mantine/core'

import { useCustomerOrdersQuery } from '../../queries/customer-orders'

import { Order } from './order'

export const Orders = (props: TabsPanelProps) => {
  const { data: orders } = useCustomerOrdersQuery()

  const customerOrders = useMemo(
    () =>
      orders ? (
        <div className="space-y-8">
          {orders.map(order => (
            <Order key={order.DisplayID} data={order} />
          ))}
        </div>
      ) : undefined,
    [orders]
  )

  return <Tabs.Panel {...props}>{customerOrders}</Tabs.Panel>
}
