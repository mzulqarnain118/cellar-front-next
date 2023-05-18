import { useState } from 'react'

import { Radio, RadioProps } from '@mantine/core'
import { clsx } from 'clsx'

import { Button } from '@/core/components/button'
import { NumberPicker } from '@/core/components/number-picker'
import { useProductQuery } from '@/lib/queries/products'

const radioClassNames: RadioProps['classNames'] = {
  labelWrapper: 'w-full text-base',
}

interface CTAProps {
  cartUrl: string
}

type Option = 'auto-sip' | 'one-time'

export const CTA = ({ cartUrl }: CTAProps) => {
  const { data: flightData } = useProductQuery(cartUrl)
  const [selectedOption, _setSelectedOption] = useState<Option>('one-time')

  return (
    <div className="my-4 space-y-4 border-y border-neutral-light py-6">
      {flightData?.autoSipProduct !== undefined ? (
        <div className="grid grid-cols-2 gap-4">
          <Radio
            checked={selectedOption === 'one-time'}
            className={clsx(
              'rounded border-2 border-neutral-light px-4 py-3 transition-colors',
              selectedOption === 'one-time' && '!border-neutral-dark'
            )}
            classNames={radioClassNames}
            color="dark"
            label="One-time purchase"
            size="lg"
          />
          <Radio
            checked={selectedOption === 'auto-sip'}
            className={clsx(
              'rounded border-2 border-neutral-light px-4 py-3 transition-colors',
              selectedOption === 'auto-sip' && '!border-neutral-dark'
            )}
            classNames={radioClassNames}
            color="dark"
            label="Auto-Sip™"
            size="lg"
          />
        </div>
      ) : undefined}
      <div className="grid auto-rows-auto grid-cols-[auto_1fr] gap-4">
        <NumberPicker value={1} />
        <Button dark className="text-lg">
          Add to cart
        </Button>
      </div>
    </div>
  )
}
