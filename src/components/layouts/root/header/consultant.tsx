import Link from 'next/link'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANTS_PAGE_PATH } from '@/lib/paths'
import { useConsultantQuery } from '@/lib/queries/consultant'

/**
 * Displays the user's consultant or the CTA to shop with a consultant.
 */
export const Consultant = () => {
  const { data, isFetching, isLoading } = useConsultantQuery()

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
          <div className="text-sm font-bold">{data.displayName || data.url}</div>
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
