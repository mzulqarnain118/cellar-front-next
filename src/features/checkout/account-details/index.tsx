import { useCallback, useEffect, useMemo, useState } from 'react'

import { PencilIcon } from '@heroicons/react/24/outline'
import { Box, LoaderProps, LoadingOverlay } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'

import { CheckoutStore, useCheckoutStore } from '@/lib/stores/checkout'

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

  const checkoutStoreOptions = useCallback(
    (state: CheckoutStore) => ({
      accountDetails: state.accountDetails,
      setAccountDetails: state.setAccountDetails,
    }),
    []
  )
  const { accountDetails: actualAccountDetails, setAccountDetails } =
    useCheckoutStore(checkoutStoreOptions)
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
          {accountDetails.giftMessage !== undefined && !editing ? (
            <div className="flex flex-col">
              <span className="font-semibold">Gift message:</span>
              <span>{accountDetails.giftMessage.recipientEmail}</span>
              <span>{accountDetails.giftMessage.message}</span>
            </div>
          ) : (
            <></>
          )}
        </>
      ),
    [accountDetails, editing, toggleEdit, toggleOverlay]
  )

  return (
    <Box pos="relative">
      <LoadingOverlay loaderProps={loaderProps} overlayBlur={1} visible={visible} />
      <div className="flex w-full flex-col rounded border border-neutral-300 bg-neutral-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h6 className="!font-semibold">Account Details</h6>
          {!editing ? (
            <button className="btn-link btn-sm btn items-center gap-2" onClick={toggleEdit}>
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <button className="btn-link btn-sm btn" onClick={toggleEdit}>
              Cancel
            </button>
          )}
        </div>
        {details}
      </div>
    </Box>
  )
}
