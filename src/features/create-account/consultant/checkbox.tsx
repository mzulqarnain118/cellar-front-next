import { useState } from 'react'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
// import algoliasearch from 'algoliasearch/lite'
import { clsx } from 'clsx'
import { useFormContext } from 'react-hook-form'

import { Typography } from '@/core/components/typogrpahy'
import { useConsultantStore } from '@/lib/stores/consultant'

import { CreateAccountSchema } from 'src/features/create-account/form'
import { GuestCheckoutSchema } from 'src/features/guest-checkout'

// const searchClient = algoliasearch(
//   process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
//   process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ''
// )
// const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'dev_consultants'

interface ConsultantCheckboxProps {
  isChecked?: boolean
  disabled?: boolean
}

export const ConsultantCheckbox = ({ disabled = false, isChecked }: ConsultantCheckboxProps) => {
  const {
    // control,
    formState: { errors },
    register,
  } = useFormContext<CreateAccountSchema | GuestCheckoutSchema>()
  const { resetConsultant } = useConsultantStore()
  const [checked, setChecked] = useState(isChecked !== undefined ? isChecked : disabled)
  const [updatedFromSearch, _setUpdatedFromSearch] = useState(false)
  const isDisabled = disabled && !updatedFromSearch

  // const handleConsultantSelect = useCallback(() => setUpdatedFromSearch(true), [])

  return (
    <div className={clsx('z-0', checked && 'z-30')}>
      <div className="grid grid-cols-[1rem_auto] items-center gap-2 pb-3">
        <input
          aria-describedby="shoppingWithConsultant"
          className="checkbox-primary checkbox checkbox-xs rounded"
          disabled={isDisabled}
          id="shoppingWithConsultant"
          type="checkbox"
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
        <label
          className={clsx(
            'mb-0 ml-2 cursor-pointer font-medium text-gray-900',
            isDisabled && 'cursor-not-allowed'
          )}
          htmlFor="shoppingWithConsultant"
        >
          I&apos;m shopping with a consultant.
        </label>
      </div>
      <div
        className={clsx(
          'grid max-h-0 w-0 pl-6 opacity-0 transition-all duration-500',
          checked && '!max-h-28 w-auto opacity-100 md:w-80'
        )}
      >
        <label className="m-0" htmlFor="consultant">
          Your Consultant
        </label>
        {/* <InstantSearch indexName={algoliaIndex} searchClient={searchClient}>
          <ConsultantSearch
            control={control}
            disabled={isDisabled}
            handleSelect={handleConsultantSelect}
            name="consultant"
          />
        </InstantSearch> */}
        <div
          className={clsx(
            'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
            errors.consultant?.message && '!max-h-12 opacity-100'
          )}
        >
          <Typography className=" text-error">
            {errors.consultant?.message ? (
              <ExclamationTriangleIcon className="h-6 w-6" />
            ) : undefined}
          </Typography>
          <Typography className="text-error">{errors.consultant?.message}</Typography>
        </div>
      </div>
    </div>
  )
}
