import { useEffect, useMemo, useState } from 'react'

import { PencilIcon } from '@heroicons/react/24/outline'
import { Blockquote, Box, Button, LoaderProps, LoadingOverlay } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'

import {
  CheckoutStore,
  useCheckoutAccountDetails,
  useCheckoutActions,
  useCheckoutGiftMessage,
} from '@/lib/stores/checkout'

import { GiftMessage } from './gift-message'

const loaderProps: LoaderProps = {
  color: 'brand.2',
  size: 'lg',
  variant: 'dots',
}

export const AccountDetails = () => {
  const [editing, { toggle: toggleEdit }] = useDisclosure()
  const [visible, { toggle: toggleOverlay }] = useDisclosure(false)

  const { data: session } = useSession()

  const actualAccountDetails = useCheckoutAccountDetails()
  const giftMessage = useCheckoutGiftMessage()
  const { setAccountDetails } = useCheckoutActions()
  const [accountDetails, setDisplayedAccountDetails] = useState<CheckoutStore['accountDetails']>()

  useEffect(() => {
    if (session?.user) {
      const { dateOfBirth, email, fullName } = session.user
      setAccountDetails({ dateOfBirth, email, fullName, isLoading: false })
    }
  }, [session?.user, setAccountDetails])

  useEffect(() => {
    setDisplayedAccountDetails(actualAccountDetails)
  }, [actualAccountDetails])

  const details = useMemo(
    () =>
      accountDetails === undefined ? (
        <>Loading...</>
      ) : (
        <>
          <span>{accountDetails.fullName}</span>
          <span>{accountDetails.email}</span>
          {editing && <GiftMessage toggleEdit={toggleEdit} toggleOverlay={toggleOverlay} />}
          {!!giftMessage.message && !editing ? (
            <>
              Your gift message to be sent to {giftMessage.recipientEmail}
              <Blockquote cite={`- ${accountDetails.fullName}`} icon={null}>
                {giftMessage.message}
                {/* <div className="mt-2 flex flex-col">
                <span className="font-semibold">Gift message:</span>
                <span>{giftMessage.recipientEmail}</span>
                <span>{giftMessage.message}</span>
              </div> */}
              </Blockquote>
            </>
          ) : (
            <></>
          )}
        </>
      ),
    [accountDetails, editing, giftMessage, toggleEdit, toggleOverlay]
  )

  return (
    <Box pos="relative">
      <LoadingOverlay loaderProps={loaderProps} overlayBlur={1} visible={visible} />
      <div className="flex w-full flex-col rounded border border-neutral-300 bg-neutral-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h6 className="!font-semibold">Account Details</h6>
          {!editing ? (
            <Button className="btn-sm items-center gap-2" variant="subtle" onClick={toggleEdit}>
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button className="btn-sm" variant="subtle" onClick={toggleEdit}>
              Cancel
            </Button>
          )}
        </div>
        {details}
      </div>
    </Box>
  )
}
