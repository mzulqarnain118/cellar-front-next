import { MutableRefObject, memo } from 'react'

import dynamic from 'next/dynamic'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Collapse } from '@mantine/core'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

import { Typography } from '@/core/components/typogrpahy'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useConsultantQuery } from '@/lib/queries/consultant'

const GiftMessageForm = dynamic(
  () => import('./gift-message-form').then(({ GiftMessageForm }) => GiftMessageForm),
  { ssr: false }
)

export interface ContactInformationRefs {
  giftMessageRef: MutableRefObject<HTMLTextAreaElement | null>
  isGiftRef: MutableRefObject<HTMLInputElement | null>
  recipientEmailRef: MutableRefObject<HTMLInputElement | null>
}

interface ContactInformationProps {
  opened: boolean
  refs: ContactInformationRefs
  toggle: () => void
}

export const ContactInformation = memo(({ opened, refs, toggle }: ContactInformationProps) => {
  const { data: session } = useSession()
  const { data: consultant } = useConsultantQuery()

  return (
    <>
      <div
        className={clsx('flex cursor-pointer items-center justify-between rounded p-4')}
        role="button"
        tabIndex={0}
        onClick={() => {
          toggle()
        }}
        onKeyDown={() => {
          toggle()
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          1. Contact information
        </Typography>
        {opened ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
      </div>

      <Collapse className="!m-0 p-4" in={opened} transitionDuration={300}>
        <div className="relative space-y-4">
          <div>
            <Typography noSpacing as="p">
              {session?.user?.fullName}
            </Typography>
            <Typography noSpacing as="p">
              {session?.user?.email}
            </Typography>
            {consultant.displayId !== CORPORATE_CONSULTANT_ID ? (
              <Typography noSpacing as="p">
                You&apos;re shopping with:{' '}
                <Typography as="strong">{consultant.displayName || consultant.url}</Typography>
              </Typography>
            ) : undefined}
          </div>
          <GiftMessageForm refs={refs} />
        </div>
      </Collapse>
    </>
  )
})

ContactInformation.displayName = 'ContactInformation'
