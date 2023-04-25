import { useMemo } from 'react'

import { Tabs } from '@mantine/core'
import { clsx } from 'clsx'

import { CheckoutTab } from '@/lib/stores/checkout'

interface TabProps {
  active?: boolean
  complete?: boolean
  disabled?: boolean
  value: CheckoutTab
}

export const Tab = ({ active = false, complete = false, disabled = false, value }: TabProps) => {
  let step = 1
  if (value === 'shipping') {
    step = 2
  } else if (value === 'payment') {
    step = 3
  }

  const icon = useMemo(
    () => (
      <div
        className={clsx(
          `
            inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900
            text-neutral-50
          `,
          !active && !complete && '!bg-neutral-500'
        )}
      >
        {step}
      </div>
    ),
    [active, complete, step]
  )

  return (
    <Tabs.Tab disabled={disabled} icon={icon} value={value}>
      <span className="capitalize">{active || complete ? value : undefined}</span>
    </Tabs.Tab>
  )
}
