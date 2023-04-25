import { ChangeEventHandler, useCallback, useMemo, useState } from 'react'

import { Collapse, Switch } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import algoliasearch from 'algoliasearch/lite'
import { useFormContext } from 'react-hook-form'
import { InstantSearch } from 'react-instantsearch-hooks-web'

import { ConsultantSchema } from '@/features/cart/checkout-drawer'
import { ConsultantSearch } from '@/features/create-account/consultant/search'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useConsultantStore } from '@/lib/stores/consultant'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ''
)
const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'dev_consultants'

interface ConsultantCheckboxProps {
  disabled?: boolean
}

export const ConsultantCheckbox = ({ disabled = false }: ConsultantCheckboxProps) => {
  const { control, register } = useFormContext<ConsultantSchema>()
  const { consultant, resetConsultant } = useConsultantStore()

  const disclosureOptions = useMemo(
    () => ({
      onClose: () => resetConsultant(),
    }),
    [resetConsultant]
  )

  const [checked, { toggle }] = useDisclosure(
    consultant.displayId !== CORPORATE_CONSULTANT_ID,
    disclosureOptions
  )
  const [updatedFromSearch, setUpdatedFromSearch] = useState(false)
  const isDisabled = disabled && !updatedFromSearch
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(() => {
    toggle()
  }, [toggle])

  const handleConsultantSelect = useCallback(() => setUpdatedFromSearch(true), [])

  return (
    <div className="col-span-2 space-y-2">
      <Switch
        checked={checked}
        color="dark"
        label="I'm shopping with a consultant."
        {...register('shoppingWithConsultant', { onChange })}
      />
      <Collapse in={checked}>
        <InstantSearch indexName={algoliaIndex} searchClient={searchClient}>
          <ConsultantSearch
            control={control}
            disabled={isDisabled}
            handleSelect={handleConsultantSelect}
            name="consultant"
          />
        </InstantSearch>
      </Collapse>
    </div>
  )
}
