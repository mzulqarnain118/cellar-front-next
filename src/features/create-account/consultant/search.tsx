import { useCallback, useMemo, useState } from 'react'

import { clsx } from 'clsx'
import { useController, UseControllerProps } from 'react-hook-form'
import { useSearchBox } from 'react-instantsearch-hooks-web'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useConsultantStore } from '@/lib/stores/consultant'

import { GuestCheckoutSchema } from 'src/features/guest-checkout'

import { CreateAccountSchema } from '../form'

import { Hits } from './hits'

export const ConsultantSearch = ({
  disabled = false,
  handleSelect,
  ...rest
}: UseControllerProps<CreateAccountSchema | GuestCheckoutSchema> & {
  disabled?: boolean
  handleSelect: () => void
}) => {
  const { refine } = useSearchBox()
  const {
    field,
    formState: { errors },
  } = useController<CreateAccountSchema | GuestCheckoutSchema>(rest)
  const [value, setValue] = useState('')
  const [showHits, setShowHits] = useState(false)
  const { consultant } = useConsultantStore()

  const handleConsultantSelect = useCallback(() => {
    setValue('')
    setShowHits(false)
    handleSelect()
  }, [handleSelect])

  const placeholder = useMemo(
    () =>
      consultant.displayId === CORPORATE_CONSULTANT_ID
        ? undefined
        : `${consultant.displayName || consultant.url} (${consultant.displayId})`,
    [consultant]
  )

  return (
    <>
      <input
        className={clsx(
          `
            z-10 h-10 rounded-lg border border-[#BDBDBD] bg-[#EFEFEF] px-3
            transition-all duration-500 placeholder:text-[#7C7C7C] focus:!outline
            focus:outline-1 focus:outline-offset-0 focus:outline-[#464c2c]
            disabled:cursor-not-allowed md:w-full
          `,
          errors.consultant?.message && '!border-red-700 focus:!outline-red-700'
        )}
        id="consultant"
        placeholder={placeholder}
        type="text"
        {...field}
        disabled={disabled}
        value={value}
        onChange={event => {
          field.onChange(event)

          const search = event.target.value
          refine(search)
          setShowHits(!!search)
          setValue(search)
        }}
      />
      {showHits && <Hits handleConsultantSelect={handleConsultantSelect} />}
    </>
  )
}
