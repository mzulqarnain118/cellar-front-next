import { useCallback, useEffect, useMemo, useState } from 'react'

import { Autocomplete, AutocompleteItem } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { UseControllerProps } from 'react-hook-form'
import { useHits, useSearchBox } from 'react-instantsearch-hooks-web'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANT_QUERY_KEY, getConsultantData } from '@/lib/queries/consultant'
import { useConsultantStore } from '@/lib/stores/consultant'
import { Consultant } from '@/lib/types'

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
  purl = '',
  register,
  name,
  errors,
}: UseControllerProps & {
  purl?: string | string[]
  disabled?: boolean
  handleSelect: (consultant?: Consultant) => void
}) => {
  const { refine } = useSearchBox()

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

  useEffect(() => {
    if (purl) {
      const selectedConsultant = hits?.find(hit => hit.Url == purl)
      if (selectedConsultant !== undefined) {
        const newConsultant = {
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
        } satisfies Consultant
        setConsultant(newConsultant)
        queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, selectedConsultant.Url], getConsultantData)
        handleSelect(newConsultant)
      }

      handleSelect()
    }
  }, [purl])

  const handleConsultantSelect = useCallback(
    (info: AutocompleteItem) => {
      const selectedConsultant = hits.find(hit => hit.DisplayID === info.id)

      if (selectedConsultant !== undefined) {
        const newConsultant = {
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
        } satisfies Consultant
        setConsultant(newConsultant)
        queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, selectedConsultant.Url], getConsultantData)
        handleSelect(newConsultant)
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
      refine(search)
      setValue(search)
    },
    [refine]
  )
  return (
    <Autocomplete
      className="mt-2"
      data={data}
      error={errors.consultant?.message?.toString()}
      onItemSubmit={handleConsultantSelect}
      {...register(name)}
      disabled={disabled}
      label="Your consultant"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  )
}
