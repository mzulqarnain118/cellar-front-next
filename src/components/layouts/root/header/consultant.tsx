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
      <div className="flex animate-pulse flex-col items-end space-y-2">
        <div className="h-2 w-20 rounded bg-neutral-400" />
        <div className="h-2 w-28 rounded bg-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-in flex-col text-right duration-1000">
      {consultant.displayId !== CORPORATE_CONSULTANT_ID ? (
        <div>
          <Typography>My Consultant</Typography>
          <div className="text-sm font-bold">
            <Typography>{consultant.displayName || consultant.url}</Typography>
          </div>
        </div>
      ) : (
        <Link className="text-sm hover:underline" href={CONSULTANTS_PAGE_PATH}>
          Are you shopping with a consultant?
        </Link>
      )}
    </div>
  )
}
