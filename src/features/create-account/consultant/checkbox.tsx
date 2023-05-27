import { useCallback, useState } from 'react'

// import algoliasearch from 'algoliasearch/lite'
import { Collapse } from '@mantine/core'
import algoliasearch from 'algoliasearch/lite'
import { clsx } from 'clsx'
import { useFormContext } from 'react-hook-form'
import { InstantSearch } from 'react-instantsearch-hooks-web'

import { Checkbox } from '@/core/components/checkbox'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ConsultantSearch } from './search'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ''
)
const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'dev_consultants'

interface ConsultantCheckboxProps {
  isChecked?: boolean
  disabled?: boolean
}

export const ConsultantCheckbox = ({ disabled = false, isChecked }: ConsultantCheckboxProps) => {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext()
  const { resetConsultant } = useConsultantStore()
  const [checked, setChecked] = useState(isChecked !== undefined ? isChecked : disabled)
  const [updatedFromSearch, setUpdatedFromSearch] = useState(false)
  const isDisabled = disabled && !updatedFromSearch

  const handleConsultantSelect = useCallback(() => setUpdatedFromSearch(true), [])

  return (
    <div className={clsx('z-0 my-4', checked && 'z-30')}>
      <Checkbox
        color="dark"
        disabled={isDisabled}
        error={errors?.consultant?.message?.toString()}
        label="I'm shopping with a consultant"
        {...register('shoppingWithConsultant', {
          onChange: () => {
            let newValue
            setChecked(prev => {
              newValue = !prev
              return newValue
            })

            if (!newValue) {
              resetConsultant()
            }
          },
        })}
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
