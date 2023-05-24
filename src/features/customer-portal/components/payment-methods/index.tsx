import { useCallback, useMemo } from 'react'

import { PlusIcon } from '@heroicons/react/20/solid'
import { Tabs, TabsPanelProps } from '@mantine/core'
import { modals } from '@mantine/modals'

import { Button } from '@/core/components/button'

import { useCustomerQuery } from '../../queries/customer'

import { AddCreditCardForm } from './add-credit-card-form'
import { CreditCard } from './credit-card'

const plusIcon = <PlusIcon className="h-4 w-4" />

export const PaymentMethods = (props: TabsPanelProps) => {
  const { data: customer } = useCustomerQuery()

  const paymentMethods = useMemo(
    () =>
      customer?.Person_CreditCards ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {customer.Person_CreditCards.sort((a, b) =>
            a.DefaultPaymentMethod && !b.DefaultPaymentMethod ? -1 : 0
          ).map(creditCard => (
            <CreditCard key={creditCard.PaymentToken} data={creditCard} />
          ))}
        </div>
      ) : undefined,
    [customer?.Person_CreditCards]
  )

  const handleCreditCardAdd = useCallback(
    () =>
      modals.open({
        centered: true,
        children: <AddCreditCardForm handleClose={modals.closeAll} />,
        size: 'lg',
        title: 'Add credit card',
      }),
    []
  )

  return (
    <Tabs.Panel {...props}>
      <div className="mb-4 flex items-center justify-end">
        <Button color="ghost" startIcon={plusIcon} variant="outline" onClick={handleCreditCardAdd}>
          Add new credit card
        </Button>
      </div>
      {paymentMethods}
    </Tabs.Panel>
  )
}
