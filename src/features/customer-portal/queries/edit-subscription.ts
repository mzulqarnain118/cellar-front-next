import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'

import { CustomerAddress, CustomerCreditCard } from './customer'

export interface CustomerSubscription {
  SubscriptionID: number | null
  SKU: string | null
  ProductID: number
  PersonID: number
  PersonDisplayID: string | null
  PersonTypeID: number
  CurrencyTypeID: number
  ProductDisplayName: string | null
  Quantity: number
  AddressID: number | null
  PaymentToken: string | null
  Addresses: CustomerAddress[] | null
  CreditCards: CustomerCreditCard[] | null
  // Echecks: CustomerEcheck[] | null
  NextProcessingDate: string | null
  ProductImageURL: string | null
  DateCreated: string
  WebsiteID: number
  ProductURL: string | null
  Frequency: string | null
  SubscriptionFrequencyID: number
  Frequencies: { Key: number; Value: string | null }[] | null
  ShippingMethods: { Key: number; Value: string | null }[] | null
  ShippingMethodID: number | null
  ShippingMethod: string | null
  AllowedDays: number[] | null
  AllowUserChangeFrequency: boolean
  AllowUserSetSubscriptionDate: boolean
  AllowUserSetSubscriptionDateMaxDays: number | null
  AllowUserPauseSubscription: boolean
  AllowUserCancelSubscription: boolean
  AllowUserChangeQuantity: boolean
  AllowUserChangeShippingMethod: boolean
  ConfigurationDisplayMessage: string | null
  ConsultantEditingForCustomer: boolean
  LegalAgreements: { Name: string | null; Details: string | null }[] | null
  PaymentMethodID: number | null
  PaymentMethods: { Key: number; Value: string | null }[] | null
  CryptoCurrencyTypeID: number | null
  TransactionEmail: string | null
  CryptoCurrencyTypes:
    | {
        Abbreviation: string | null
        Enabled: boolean
        Name: string | null
      }[]
    | null
  AllowUserChangeMaximumNumberOfOrders: boolean
  MaximumNumberOfOrders: number | null
  ProductBusinessUnitID: number | null
  Volumes:
    | {
        Display: boolean
        Volume: number
        VolumeTypeAbbreviation: string | null
      }[]
    | null
  EstimatedPrice: number | null
  EstimatedSubtotal: number | null
  EstimatedShipping: number | null
  EstimatedHandling: number | null
  EstimatedTax: number | null
  EstimatedTotal: number | null
  HandlingMethodEnabled: boolean
  TaxInDisplayPrice: boolean
}

interface EditSubscriptionOptions {
  enabled: boolean
  sku: string
  subscriptionId: number
}

export const getEditSubscription: QueryFunction<
  CustomerSubscription,
  (string | EditSubscriptionOptions)[]
> = async ({ queryKey }) => {
  try {
    const personDisplayId = queryKey[1] as string
    const { sku, subscriptionId } = queryKey[2] as EditSubscriptionOptions
    const response = await api('CustomerPortal/GetSubscriptionToEdit', {
      method: 'get',
      searchParams: {
        personDisplayId,
        sku,
        subscriptionId,
        websiteId: -1,
      },
    }).json<CustomerSubscription>()

    return response
  } catch {
    throw new Error('')
  }
}

export const useEditSubscriptionQuery = (data: EditSubscriptionOptions) => {
  const { data: session } = useSession()

  return useQuery({
    enabled: data.enabled,
    queryFn: getEditSubscription,
    queryKey: ['edit-subscription', session?.user?.displayId || '', data],
  })
}
