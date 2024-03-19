import { useEffect, useState } from 'react'

import { Collapse, Select } from '@mantine/core'
import { z } from 'zod'

import { Checkbox } from '@/core/components/checkbox'
import { useTastingEventStorage } from '@/lib/hooks/use-tasting-storage'
import { setTasting } from '@/lib/queries/cart'

import { ContactInformationRefs } from '.'

type GiftMessageFormSchema = z.infer<typeof giftMessageFormSchema>

interface GiftMessageFormProps {
  refs: ContactInformationRefs
}

const convertDateFormat = (dateString: string) => {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear().toString()
  return `${month}/${day}/${year}`
}

export const TastingSelect = ({
  refs,
  tastingsResponse,
  consultantDisplayId,
  consultantUrl,
  cartId,
}: GiftMessageFormProps) => {
  const [tastingStorage, setTastingStorage] = useTastingEventStorage()
  const [checkBox, setCheckBox] = useState(false)

  const [selectedOption, setSelectedOption] = useState(null)

  const tastings = tastingsResponse?.Data?.map(tasting => ({
    ...tasting,
    label: `${tasting.DisplayName} on ${convertDateFormat(tasting.EventDateTime)}`,
    value: tasting?.DisplayID,
  }))

  useEffect(() => {
    if (tastingStorage?.Value?.DisplayID) {
      setCheckBox(!!tastingStorage?.Value?.DisplayID)
      setSelectedOption(tastingStorage?.Value?.DisplayID)
    }
  }, [tastingStorage])

  return (
    <>
      <Checkbox
        checked={checkBox || tastingStorage}
        color="dark"
        disabled={tastingStorage}
        label="Is this a tasting?"
        onChange={() => setCheckBox(checkBox => !checkBox)}
      />
      <Collapse in={checkBox}>
        <Select
          dropdownOpened
          checkIconPosition="left"
          data={tastings ?? []}
          disabled={!!tastingStorage?.Value?.DisplayID}
          pb={10}
          value={selectedOption}
          onChange={_value => {
            setSelectedOption(_value)
            const tastingResponse = setTasting({
              cartId,
              consultantDisplayId,
              eventshare: _value,
              consultantUrl,
            })
            setTastingStorage(tastingResponse)
          }}
        />
      </Collapse>
    </>
  )
}
