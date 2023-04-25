import { useCallback, useMemo, useState } from 'react'

import { Autocomplete, AutocompleteItem } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { UseControllerProps, useController } from 'react-hook-form'
import { useHits, useSearchBox } from 'react-instantsearch-hooks-web'

import { ConsultantSchema } from '@/features/cart/checkout-drawer'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANT_QUERY_KEY, getConsultantData } from '@/lib/queries/consultant'
import { useConsultantStore } from '@/lib/stores/consultant'

type Form = ConsultantSchema

interface ConsultantHit extends Record<string, string | object> {
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

export const ConsultantSearch = ({
  disabled = false,
  handleSelect,
  ...rest
}: UseControllerProps<Form> & {
  disabled?: boolean
  handleSelect: () => void
}) => {
  const { refine } = useSearchBox()
  const {
    field,
    formState: { errors },
  } = useController<Form>(rest)
  const { hits } = useHits<ConsultantHit>()
  const [value, setValue] = useState('')
  const { consultant } = useConsultantStore()
  const { setConsultant } = useConsultantStore()
  const queryClient = useQueryClient()

  const data = useMemo(
    () =>
      hits
        .filter(hit => !!hit.DisplayID)
        .map(hit => ({
          id: hit.DisplayID,
          value: `${hit.DisplayName} - ${hit.Address.ProvinceAbbreviation}`,
        })),
    [hits]
  )

  const handleConsultantSelect = useCallback(
    (info: AutocompleteItem) => {
      setValue('')
      const selectedConsultant = hits.find(hit => hit.DisplayID === info.id)

      if (selectedConsultant !== undefined) {
        setConsultant({
          address: {
            city: selectedConsultant.Address?.City,
            stateAbbreviation: selectedConsultant.Address?.ProvinceAbbreviation,
            zipCode: selectedConsultant.Address?.PostalCode,
          },
          displayId: selectedConsultant.DisplayID,
          displayName: selectedConsultant.DisplayName || '',
          emailAddress: selectedConsultant.EmailAddress || undefined,
          imageUrl: selectedConsultant.ImageURL || undefined,
          phoneNumber: selectedConsultant.PhoneNumber || undefined,
          profileWebsite: selectedConsultant.ProfileWebsite || undefined,
          socialLinks: selectedConsultant.SocialLinks?.map(link => ({
            baseUrl: link.LinkBaseURL,
            name: link.LinkName,
            url: link.URL,
          })),
          url: selectedConsultant.Url,
        })
        queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, selectedConsultant.Url], getConsultantData)
      }

      handleSelect()
    },
    [handleSelect, hits, queryClient, setConsultant]
  )

  const placeholder = useMemo(
    () =>
      consultant.displayId === CORPORATE_CONSULTANT_ID
        ? 'Search for your consultant'
        : `${consultant.displayName || consultant.url} (${consultant.displayId})`,
    [consultant]
  )

  const onChange = useCallback(
    (search: string) => {
      field.onChange()
      refine(search)
      setValue(search)
    },
    [field, refine]
  )

  return (
    <>
      <Autocomplete
        data={data}
        error={errors.consultant?.message}
        onItemSubmit={handleConsultantSelect}
        {...field}
        disabled={disabled}
        label="Your consultant"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </>
  )
}
