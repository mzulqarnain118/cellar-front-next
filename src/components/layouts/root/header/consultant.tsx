import dynamic from 'next/dynamic'

import { Typography } from '@/core/components/typogrpahy'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANTS_PAGE_PATH } from '@/lib/paths'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useConsultantStore } from '@/lib/stores/consultant'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

/**
 * Displays the user's consultant or the CTA to shop with a consultant.
 */
export const Consultant = () => {
  const { consultant } = useConsultantStore()
  const { isFetching, isLoading } = useConsultantQuery()

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse items-end space-y-2">
        <div className="h-2 w-20 rounded bg-neutral-400" />
        <div className="h-2 w-28 rounded bg-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-in flex-col text-right duration-1000">
      <Link
        className="!text-neutral-dark"
        href={
          consultant?.displayId !== CORPORATE_CONSULTANT_ID
            ? `${CONSULTANTS_PAGE_PATH}/${consultant?.url}`
            : CONSULTANTS_PAGE_PATH
        }
      >
        {consultant?.displayId !== CORPORATE_CONSULTANT_ID ? (
          <div>
            <Typography className="text-sm">Shopping with: </Typography>
            <Typography className="text-14">
              {consultant?.displayName || consultant?.url}
            </Typography>
          </div>
        ) : (
          'Shopping with a consultant?'
        )}
      </Link>
    </div>
  )
}
