import { useCallback } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Paper } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANT_QUERY_KEY, getConsultantData } from '@/lib/queries/consultant'
import { useConsultantStore } from '@/lib/stores/consultant'
import { Consultant } from '@/lib/types'

interface HitProps {
  hit: any
  setConsultantInputValue: (consultant: string) => void
}

const Hit = ({ hit: consultant, setConsultantInputValue }: HitProps) => {
  const router = useRouter()
  const { setConsultant } = useConsultantStore()
  const queryClient = useQueryClient()

  const handleSelect = useCallback(
    (consultant?: Consultant) => {
      if (consultant?.displayId !== CORPORATE_CONSULTANT_ID) {
        router.push(`/`)
      }
    },
    [router]
  )

  const handleConsultantSelect = () => {
    setConsultantInputValue('')

    const selectedConsultant = consultant

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
        socialLinks: selectedConsultant.SocialLinks?.map(
          (link: { LinkBaseURL: string; LinkName: string; URL: string }) => ({
            baseUrl: link.LinkBaseURL,
            name: link.LinkName,
            url: link.URL,
          })
        ),
        url: selectedConsultant.Url,
      } satisfies Consultant
      localStorage.setItem('u', selectedConsultant.Url)
      setConsultant(newConsultant)
      queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, selectedConsultant.Url], getConsultantData)
      handleSelect(newConsultant)
    }

    handleSelect()
  }

  return (
    <Paper
      withBorder
      className="cursor-pointer flex flex-col md:flex-row md:gap-4 items-center md:items-center md:justify-start min-h-[150px] md:min-w-[200px] p-[20px]"
      id={consultant.url}
      onClick={() => handleConsultantSelect()}
    >
      {consultant.ImageURL ? (
        <Image
          alt={`${consultant?.DisplayName} image`}
          className="max-h-[125px] w-auto object-contain"
          height={100}
          loading="lazy"
          src={consultant?.ImageURL}
          width={100}
        />
      ) : (
        <div className="no-image"></div>
      )}
      <div>
        <h6
          className={`font-heading  !text-2xl text-[#212529] mb-4 mt-4 md:mt-0 text-center md:text-left`}
        >
          {consultant.DisplayName}
        </h6>
        <Link
          className="block hover:text-[#0056b3] text-lg text-black text-center md:text-left text-wrap"
          href={`mailto:${consultant.EmailAddress?.toLowerCase()}`}
        >
          {consultant.EmailAddress?.toLowerCase()}
        </Link>
        <Link
          className="block hover:text-[#0056b3] text-black text-lg text-center md:text-left"
          href={`tel:${consultant.PhoneNumber}`}
        >
          {consultant.PhoneNumber}
        </Link>
      </div>
    </Paper>
  )
}

export default Hit
