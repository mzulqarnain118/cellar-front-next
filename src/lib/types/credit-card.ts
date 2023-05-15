import { Address } from './address'

export interface CreditCard {
  PaymentToken: string
  CreditCardTypeID: number
  CreditCardTypeName: string
  NameOnCard: string
  CardNumber: string
  DisplayNumber: string
  ExpirationMonth: string
  ExpirationYear: string
  DefaultPaymentMethod: boolean
  CVV: string | null
  Address: Address
  FriendlyDescription: string
}
