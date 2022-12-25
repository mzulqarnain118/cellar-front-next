import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANTS_PAGE_PATH } from '@/lib/paths'
import { CONSULTANT_QUERY_KEY, getConsultantData } from '@/lib/queries/consultant'
import { DEFAULT_CONSULTANT_STATE, useConsultantStore } from '@/lib/stores/consultant'

/**
 * Displays the user's consultant or the CTA to shop with a consultant.
 */
export const Consultant = () => {
  const { consultant, setConsultant } = useConsultantStore()
  const { query } = useRouter()
  const { data, isFetching, isLoading } = useQuery(
    [...CONSULTANT_QUERY_KEY, query.u || consultant.url || 'store'],
    getConsultantData,
    {
      initialData: DEFAULT_CONSULTANT_STATE,
      onError: () => setConsultant(DEFAULT_CONSULTANT_STATE),
      onSuccess: data => {
        setConsultant(data)
      },
      refetchOnWindowFocus: false,
    }
  )

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse flex-col items-end space-y-2">
        <div className="h-2 w-20 rounded bg-primary-300" />
        <div className="h-2 w-28 rounded bg-primary-300" />
      </div>
    )
  }

  return (
    <div className="flex flex-col text-right">
      {data.displayId !== CORPORATE_CONSULTANT_ID ? (
        <>
          <span>My Consultant</span>
          <div className="text-sm font-bold">
            {data.displayName || data.url || consultant.displayName || consultant.url}
          </div>
        </>
      ) : (
        <Link
          className="text-sm hover:underline"
          href={CONSULTANTS_PAGE_PATH}
          title="Change my consultant"
        >
          Are you shopping with a consultant?
        </Link>
      )}
    </div>
  )
}
