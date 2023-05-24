import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { CreditCardIcon, ForwardIcon, HomeIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Select, SelectProps, Tabs, TabsPanelProps } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'
import { Divider } from 'react-daisyui'

import { BlurImage } from '@/components/blur-image'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { MY_ACCOUNT_PAGE_PATH } from '@/lib/paths'

import { useChargebeeQuery } from '../../queries/chargebee'
import { CustomerSubscription, useEditSubscriptionQuery } from '../../queries/edit-subscription'
import { useSubscriptionsQuery } from '../../queries/subscriptions'
import { useUpdateSubscriptionMutation } from '../../queries/update-subscription'
import { AddCreditCardForm } from '../payment-methods/add-credit-card-form'
import { AddAddressForm } from '../shipping-addresses/add-address-form'

import { Cancel } from './cancel'
import { DeliveryAddress } from './delivery-address'
import { PaymentMethod } from './payment-method'

export const ClubsEdit = (props: TabsPanelProps) => {
  const router = useRouter()
  const {
    data: subscriptions,
    isFetching: isFetchingSubscriptions,
    isLoading: isLoadingSubscriptions,
  } = useSubscriptionsQuery('AutoShip')
  const subscriptionId = parseInt(router.query.slug?.[1] || '0')

  const queryProps = useMemo(
    () => ({
      enabled: subscriptions !== undefined,
      sku:
        subscriptions
          ?.find(subscription => subscription.SubscriptionID === subscriptionId)
          ?.SKU.toLowerCase() || '',
      subscriptionId,
    }),
    [subscriptionId, subscriptions]
  )
  const {
    data: subscription,
    isFetching: isFetchingSubscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useEditSubscriptionQuery(queryProps)

  const {
    data: chargebeeData,
    isFetching: isFetchingChargebee,
    isLoading: isLoadingChargebee,
  } = useChargebeeQuery(subscriptionId)

  const loading =
    isFetchingSubscription ||
    isFetchingSubscriptions ||
    isLoadingSubscription ||
    isLoadingSubscriptions ||
    isFetchingChargebee ||
    isLoadingChargebee

  const [newFrequency, setNewFrequency] = useState<string | null>(
    subscription?.Frequencies?.[0].Key.toString() || null
  )
  const [newShippingMethod, setNewShippingMethod] = useState<string | null>(
    subscription?.ShippingMethods?.[0].Key.toString() || null
  )
  const [newNextOrderDate, setNewNextOrderDate] = useState<Date | null>(
    new Date(subscription?.NextProcessingDate || '0') || null
  )
  const [creditCardUsedForMembership, setCreditCardUsedForMembership] = useState(
    subscription?.PaymentToken || undefined
  )
  const [addressUsedForMembership, setAddressUsedForMembership] = useState(
    subscription?.AddressID || undefined
  )
  const [ageAccepted, setAgeAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [subscriptionAccepted, setSubscriptionAccepted] = useState(false)
  const [newShippingData, setNewShippingData] = useState({
    Key: subscription?.ShippingMethodID,
    Value: subscription?.ShippingMethod,
  })

  const { mutate: updateSubscription } = useUpdateSubscriptionMutation()

  useEffect(() => {
    setNewFrequency(subscription?.Frequencies?.[0].Key.toString() || null)
    setNewShippingMethod(subscription?.ShippingMethods?.[0].Key.toString() || null)
    setNewNextOrderDate(new Date(subscription?.NextProcessingDate || '0') || null)
    setCreditCardUsedForMembership(subscription?.PaymentToken || undefined)
    setAddressUsedForMembership(subscription?.AddressID || undefined)
    setNewShippingData({
      Key: subscription?.ShippingMethodID,
      Value: subscription?.ShippingMethod,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription])

  const handleAgeAcceptedChange = useCallback(() => {
    setAgeAccepted(prev => !prev)
  }, [])

  const handleTermsAcceptedChange = useCallback(() => {
    setTermsAccepted(prev => !prev)
  }, [])

  const handleSubscriptionAcceptedChange = useCallback(() => {
    setSubscriptionAccepted(prev => !prev)
  }, [])

  const membershipInfo = useMemo(
    () =>
      subscription?.EstimatedPrice ? (
        <div className="grid w-full grid-cols-2 text-sm lg:text-base">
          <div className="grid">
            <Typography className="font-bold">Price</Typography>
            <span>{formatCurrency(subscription.EstimatedPrice)}</span>
          </div>
          <div className="grid">
            <strong>Quantity</strong>
            <span>{subscription.Quantity}</span>
          </div>
        </div>
      ) : undefined,
    [subscription?.EstimatedPrice, subscription?.Quantity]
  )

  const frequencies = useMemo(
    () =>
      subscription?.Frequencies?.map(frequency => ({
        label: frequency.Value || '',
        value: frequency.Key?.toString() || '',
      })) || [],
    [subscription?.Frequencies]
  )

  const shippingMethods = useMemo(
    () =>
      subscription?.ShippingMethods?.map(shippingMethod => ({
        label: shippingMethod.Value || '',
        value: shippingMethod.Key?.toString() || '',
      })) || [],
    [subscription?.ShippingMethods]
  )

  const handleCreditCardChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newValue = event.target.value
    setCreditCardUsedForMembership(newValue)
  }, [])

  const paymentMethods = useMemo(
    () =>
      subscription?.CreditCards ? (
        <div className="grid gap-4 lg:auto-rows-auto lg:grid-cols-2">
          {subscription.CreditCards.map(creditCard =>
            creditCard.PaymentToken ? (
              <PaymentMethod
                key={creditCard.PaymentToken}
                checked={creditCardUsedForMembership === creditCard.PaymentToken}
                creditCard={creditCard}
                handleChecked={handleCreditCardChange}
                refetchSubscription={refetchSubscription}
              />
            ) : undefined
          ).filter(
            (element: JSX.Element | undefined): element is JSX.Element => element !== undefined
          )}
        </div>
      ) : undefined,
    [
      subscription?.CreditCards,
      creditCardUsedForMembership,
      handleCreditCardChange,
      refetchSubscription,
    ]
  )

  const handleDeliveryAddressChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newValue = event.target.value
    setAddressUsedForMembership(parseInt(newValue))
  }, [])

  const deliveryAddresses = useMemo(
    () =>
      subscription?.Addresses ? (
        <div className="grid gap-4 lg:auto-rows-auto lg:grid-cols-2">
          {subscription.Addresses.map(address => (
            <DeliveryAddress
              key={address.AddressID}
              address={address}
              checked={addressUsedForMembership === address.AddressID}
              handleChecked={handleDeliveryAddressChange}
            />
          ))}
        </div>
      ) : undefined,
    [addressUsedForMembership, handleDeliveryAddressChange, subscription?.Addresses]
  )

  const minDate = useMemo(() => new Date(), [])

  const frequency = useMemo(
    () => frequencies.find(frequency => frequency.label === newFrequency),
    [frequencies, newFrequency]
  )

  const newSubscription: CustomerSubscription | undefined = useMemo(
    () =>
      subscription !== undefined
        ? {
            ...subscription,
            AddressID: addressUsedForMembership || 0,
            Frequency: frequency?.value || subscription.Frequency,
            NextProcessingDate: newNextOrderDate?.toISOString() || subscription.NextProcessingDate,
            PaymentToken: creditCardUsedForMembership || subscription.PaymentToken,
            ShippingMethod: newShippingData.Value || subscription.ShippingMethod,
            ShippingMethodID: newShippingData.Key || subscription.ShippingMethodID,
            SubscriptionFrequencyID:
              parseInt(frequency?.label || '0') || subscription.SubscriptionFrequencyID,
            SubscriptionID: subscriptionId,
          }
        : undefined,
    [
      subscription,
      addressUsedForMembership,
      frequency?.value,
      frequency?.label,
      newNextOrderDate,
      creditCardUsedForMembership,
      newShippingData.Value,
      newShippingData.Key,
      subscriptionId,
    ]
  )

  const handleShippingMethodChange: SelectProps['onChange'] = useCallback(
    (value: string) => {
      setNewShippingMethod(value)

      const shippingMethod = shippingMethods.find(method => method.value === value)
      setNewShippingData({ Key: parseInt(value), Value: shippingMethod?.value || '' })
    },
    [shippingMethods]
  )

  const handleSkipClick = useCallback(
    () =>
      modals.open({
        centered: true,
        children: (
          <Cancel
            skipNext
            chargebeeData={chargebeeData}
            handleHide={modals.closeAll}
            refetch={refetchSubscription}
            subscriptionId={subscriptionId}
          />
        ),
      }),
    [chargebeeData, refetchSubscription, subscriptionId]
  )

  const handleCancelClick = useCallback(
    () =>
      modals.open({
        centered: true,
        children: (
          <Cancel
            chargebeeData={chargebeeData}
            handleHide={modals.closeAll}
            refetch={refetchSubscription}
            subscriptionId={subscriptionId}
          />
        ),
      }),
    [chargebeeData, refetchSubscription, subscriptionId]
  )

  const handleCreditCardAdd = useCallback(
    () =>
      modals.open({
        centered: true,
        children: <AddCreditCardForm handleClose={modals.closeAll} />,
        size: 'lg',
        title: 'Add credit card',
      }),
    []
  )

  const handleAddAddress = useCallback(
    () =>
      modals.open({
        centered: true,
        children: <AddAddressForm handleClose={modals.closeAll} />,
        size: 'lg',
        title: 'Add address',
      }),
    []
  )

  const handleCancel = useCallback(() => {
    router.push(`${MY_ACCOUNT_PAGE_PATH}/clubs/${subscriptionId}`)
  }, [router, subscriptionId])

  const handleSave = useCallback(() => {
    if (newSubscription !== undefined) {
      updateSubscription(newSubscription)
      showNotification({
        message: 'Your subscription changes will go in effect with the next order. Thank you!',
      })
      handleCancel()
    }
  }, [handleCancel, newSubscription, updateSubscription])

  if (loading) {
    return <>Loading...</>
  }

  return (
    <Tabs.Panel {...props}>
      <div className="mx-auto px-2">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="grid">
            <div
              className={`
                flex items-center justify-between rounded-t border-2
                border-b-0 border-solid border-[#403839] bg-[#403839] p-4 text-gray-50
              `}
            >
              <Typography as="h6" className="mb-0">
                Manage Membership
              </Typography>
              <div className="space-x-4">
                {!subscription?.SKU?.toLowerCase().startsWith('promo') ? (
                  <Button
                    className="gap-1 border-neutral-50 text-neutral-50"
                    color="ghost"
                    variant="outline"
                    onClick={handleSkipClick}
                    // onClick={() => {
                    //   setIsLoading(true)
                    //   setShowSkipNextModal(true)
                    //   setShowCancelModal(true)
                    //   setIsLoading(false)
                    // }}
                  >
                    <ForwardIcon className="h-4 w-4" />
                    <Typography className="group-hover:underline">Skip next shipment</Typography>
                  </Button>
                ) : undefined}
                <Button
                  className="gap-1 border-neutral-50 text-neutral-50"
                  color="ghost"
                  variant="outline"
                  onClick={handleCancelClick}
                  // onClick={() => {
                  //   if (customChargebeeData !== undefined) {
                  //     setIsLoading(true)
                  //     setShowSkipNextModal(false)
                  //     setShowCancelModal(true)
                  //     setIsLoading(false)
                  //   }
                  // }}
                >
                  <XCircleIcon className="h-4 w-4" />
                  <Typography className="group-hover:underline">Cancel Club</Typography>
                </Button>
              </div>
            </div>
            <div
              className={`
                grid gap-4 rounded-b border-2 border-t-0 border-solid border-[#e6e0dd] p-4
              `}
            >
              <div className="relative mx-auto mb-4 h-[15.75rem] w-[18.75rem]">
                <BlurImage
                  fill
                  alt={subscription?.ProductDisplayName || 'Product'}
                  className="object-contain"
                  src={subscription?.ProductImageURL || ''}
                />
              </div>
              <div>
                <Typography className="text-18 font-bold">
                  {subscription?.ProductDisplayName}
                </Typography>
                <Divider className="my-1" />
                {membershipInfo}
                <Divider className="my-1" />
                <div className="grid gap-4">
                  <Select
                    data={frequencies}
                    label="Frequency"
                    value={newFrequency}
                    onChange={setNewFrequency}
                  />
                  <Select
                    data={shippingMethods}
                    label="Shipping method"
                    value={newShippingMethod}
                    onChange={handleShippingMethodChange}
                  />
                  <DateInput
                    label="Next order date"
                    minDate={minDate}
                    value={newNextOrderDate}
                    onChange={setNewNextOrderDate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method. */}
          <div className="grid">
            <div
              className={`
                flex items-center justify-between rounded-t border-2 border-b-0
                border-solid border-[#403839] bg-[#403839] p-4 text-gray-50
              `}
            >
              <Typography as="h6" className="mb-0">
                Payment Method
              </Typography>
              <Button
                className="gap-1 border-neutral-50 text-neutral-50"
                color="ghost"
                variant="outline"
                onClick={handleCreditCardAdd}
              >
                <CreditCardIcon className="h-4 w-4" />
                Add credit card
              </Button>
            </div>
            <div
              className={`
                grid gap-4 rounded-b border-2 border-t-0 border-solid border-[#e6e0dd] p-4
              `}
            >
              {paymentMethods}
            </div>
          </div>

          {/* Delivery address. */}
          <div className="grid">
            <div
              className={`
                flex items-center justify-between rounded-t border-2 border-b-0
                border-solid border-[#403839] bg-[#403839] p-4 text-gray-50
              `}
            >
              <Typography as="h6" className="mb-0">
                Delivery Address
              </Typography>
              <Button
                className="gap-1 border-neutral-50 text-neutral-50"
                color="ghost"
                variant="outline"
                onClick={handleAddAddress}
                // onClick={() => setShowAddAddressModal(true)}
              >
                <HomeIcon className="h-4 w-4" />
                Add address
              </Button>
            </div>
            <div
              className={`
                grid gap-4 rounded-b border-2 border-t-0 border-solid border-[#e6e0dd] p-4
              `}
            >
              {deliveryAddresses}
            </div>
          </div>

          {/* Terms of use. */}
          <div className="grid">
            <div
              className={`
                flex items-center justify-between rounded-t border-2 border-b-0
                border-solid border-[#403839] bg-[#403839] p-4 text-gray-50
              `}
            >
              <Typography as="h6" className="mb-0">
                Terms of Use
              </Typography>
            </div>
            <div
              className={`
                grid gap-4 rounded-b border-2 border-t-0 border-solid border-[#e6e0dd] p-4
                text-sm
              `}
            >
              <div className="grid gap-1">
                <Typography as="h6">Age Verification</Typography>
                <Checkbox
                  checked={ageAccepted}
                  color="dark"
                  label="I am at least 21 years of age"
                  onChange={handleAgeAcceptedChange}
                />
              </div>

              <div className="grid gap-1">
                <Typography as="h6">Terms and Conditions</Typography>
                <Typography as="p">
                  These Terms of Use apply to your use of the Scout & Cellar site at
                  ScoutandCellar.com (the “Site”), and to content, information, products, services
                  and materials on the Site (collectively, “Content”). Read the full Terms and
                  Conditions here
                </Typography>
                <Checkbox
                  checked={termsAccepted}
                  color="dark"
                  label="I have read and agree to the Terms of Use"
                  onChange={handleTermsAcceptedChange}
                />
              </div>

              <div className="grid gap-1">
                <Typography as="h6">Subscription Agreement</Typography>
                <Typography as="p">
                  By purchasing a membership on ScoutandCellar.com you understand that you are
                  joining one of our Wine Clubs and that you will be billed immediately and every
                  subsequent month, every other month, or every quarter, depending on the frequency
                  of the specific club you selected, until you cancel your membership. The exact
                  amount of the charges will depend upon the specific club you selected. You will be
                  billed on or around the same day each month. You can cancel your membership at any
                  time by logging into your account and cancelling your membership. If you cannot or
                  do not wish to access your account online, you can cancel at any time by calling
                  customer support at (972) 638-9918 or by sending an email to
                  support@scoutandcellar.com. Your membership will begin immediately. All charges
                  will be identified as Scout & Cellar or Wine Retriever LLC on your credit card
                  statement. If your card issuing financial institution participates in the Card
                  Account Updater program, we may receive an updated card account number and/or
                  expiration date for your card on file. Unless you opt out of the program with your
                  card issuer, we will update our files and use the new information for any
                  automatic payment option in which you have enrolled, including Scout Circle and
                  Auto-Sip as applicable. We will not receive updated information if your account
                  has been closed.
                </Typography>
                <Checkbox
                  checked={subscriptionAccepted}
                  color="dark"
                  label="If I join the Club, I agree to buy wine today and then upon future shipments,
                  unless I change or cancel"
                  onChange={handleSubscriptionAcceptedChange}
                />
              </div>
            </div>
          </div>

          <div className="grid items-center gap-4 lg:ml-auto lg:flex lg:flex-row-reverse">
            <Button
              dark
              disabled={!(ageAccepted && termsAccepted && subscriptionAccepted)}
              onClick={handleSave}
            >
              Save changes
            </Button>
            <Button color="ghost" variant="outline" onClick={handleCancel}>
              Cancel changes
            </Button>
          </div>
        </div>
      </div>
    </Tabs.Panel>
  )
}
