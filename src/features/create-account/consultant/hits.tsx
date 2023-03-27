import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useHits } from 'react-instantsearch-hooks-web'

import { CONSULTANT_QUERY_KEY, getConsultantData } from '@/lib/queries/consultant'
import { useConsultantStore } from '@/lib/stores/consultant'

interface Consultant extends Record<string, string | object> {
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

interface HitsProps {
  handleConsultantSelect: () => void
}

export const Hits = ({ handleConsultantSelect }: HitsProps) => {
  const { hits } = useHits<Consultant>()
  const { setConsultant } = useConsultantStore()
  const queryClient = useQueryClient()

  const handleSelect = useCallback(
    (info: Consultant) => {
      setConsultant({
        address: {
          city: info.Address?.City,
          stateAbbreviation: info.Address?.ProvinceAbbreviation,
          zipCode: info.Address?.PostalCode,
        },
        displayId: info.DisplayID,
        displayName: info.DisplayName || '',
        emailAddress: info.EmailAddress || undefined,
        imageUrl: info.ImageURL || undefined,
        phoneNumber: info.PhoneNumber || undefined,
        profileWebsite: info.ProfileWebsite || undefined,
        socialLinks: info.SocialLinks.map(link => ({
          baseUrl: link.LinkBaseURL,
          name: link.LinkName,
          url: link.URL,
        })),
        url: info.Url,
      })
      queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, info.Url], getConsultantData)
      handleConsultantSelect()
    },
    [handleConsultantSelect, queryClient, setConsultant]
  )

  const elements = useMemo(
    () =>
      hits
        .filter(hit => !!hit.DisplayID)
        .map(hit => (
          <button
            key={hit.DisplayID}
            className="cursor-pointer border-0 p-2 hover:bg-[#d0d0d0]"
            onClick={() => handleSelect(hit)}
          >
            {`${hit.DisplayName} - ${hit.Address.ProvinceAbbreviation}`}
          </button>
        )),
    [handleSelect, hits]
  )

  return (
    <div className="relative">
      <div
        className={`
          absolute z-10 grid max-h-80 w-full overflow-auto rounded-b-lg border border-neutral-300
          bg-neutral-50
        `}
      >
        {elements}
      </div>
    </div>
  )
}
