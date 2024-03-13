import { useCallback, useMemo } from 'react'

import { Input } from '@mantine/core'
import { UseControllerProps, useController } from 'react-hook-form'
import { useSearchBox } from 'react-instantsearch'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useConsultantStore } from '@/lib/stores/consultant'
import { Consultant } from '@/lib/types'

export interface ConsultantHit extends Record<string, string | object> {
  Address: { City: string; PostalCode: string; ProvinceAbbreviation: string }
  DisplayID: string
  DisplayName: string
  EmailAddress: string
  ImageURL: string
  PhoneNumber: string
  ProfileWebsite: string
  SocialLinks: {
    LinkBaseURL: string
    LinkName: string
    URL: string
  }[]
  Url: string
}

export const ConsultantPageSearch = ({
  consultantInputValue,
  setConsultantInputValue,
  ...rest
}: UseControllerProps & {
  disabled?: boolean
  handleSelect: (consultant?: Consultant) => void
  consultantInputValue: string
  setConsultantInputValue: (consultant: string) => void
}) => {
  const { refine } = useSearchBox()
  const {
    formState: { errors },
  } = useController(rest)
  const { consultant } = useConsultantStore()

  const placeholder = useMemo(
    () =>
      consultant.displayId === CORPORATE_CONSULTANT_ID
        ? 'Search for your consultant'
        : `${consultant.displayName || consultant.url} (${consultant.displayId})`,
    [consultant]
  )

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value
      refine(search)
      setConsultantInputValue(search)
    },
    [refine, setConsultantInputValue]
  )

  return (
    <Input
      className="mt-2"
      error={errors.consultant?.message?.toString()}
      placeholder={placeholder}
      value={consultantInputValue}
      onChange={onChange}
    />
  )
}
