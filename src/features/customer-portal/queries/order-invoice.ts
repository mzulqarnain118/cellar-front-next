import { QueryFunction, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api'

const Transaction = z.object({
  Accepted: z.string(),
  Amount: z.number(),
  AmountAppliedToOrder: z.number(),
  BankName: z.string().nullable(),
  BarcodeNumber: z.string().nullable(),
  BarcodeUrl: z.string().nullable(),
  BillingAddress: z.object({
    AddressID: z.number(),
    City: z.string(),
    Company: z.string().nullable(),
    CountryID: z.number(),
    CountryName: z.string(),
    CountryThreeLetterCode: z.string().nullable(),
    CountryTwoLetterISO: z.string().nullable(),
    County: z.string().nullable(),
    DeliveryOffice: z.string().nullable(),
    DisplayName: z.string().nullable(),
    FirstName: z.string().nullable(),
    FriendlyDescription: z.string(),
    IsNexus: z.boolean().nullable(),
    IsValid: z.boolean().nullable(),
    LastName: z.string().nullable(),
    LastName2: z.string().nullable(),
    Mailing: z.boolean(),
    MiddleName: z.string().nullable(),
    NickName: z.string().nullable(),
    PhoneNumber: z.string().nullable(),
    PhoneNumberFormat: z.string().nullable(),
    PostalCode: z.string(),
    Primary: z.boolean(),
    ProvinceAbbreviation: z.string(),
    ProvinceID: z.number(),
    ProvinceName: z.string().nullable(),
    Region: z.string().nullable(),
    Residential: z.boolean(),
    Street1: z.string(),
    Street2: z.string().nullable(),
    Street3: z.string().nullable(),
    Street4: z.string().nullable(),
  }),
  CaptureDate: z.string(),
  CardType: z.string(),
  CheckNumber: z.string().nullable(),
  Comment: z.string().nullable(),
  CreditMemoAmount: z.number(),
  Date: z.string(),
  Detail: z.string(),
  DisplayID: z.string(),
  DueDate: z.string(),
  EcheckAccountType: z.string().nullable(),
  Email: z.string().nullable(),
  ExpirationDate: z.string(),
  ExternalPaymentNote: z.string().nullable(),
  FirstName: z.string().nullable(),
  Gateway: z.string(),
  HasDetails: z.boolean(),
  Last4Digits: z.string(),
  LastName: z.string().nullable(),
  LineVolumeRefunds: z.string().nullable(),
  Memo: z.string().nullable(),
  NameOnAccount: z.string().nullable(),
  NameOnCard: z.string().nullable(),
  NameOnCheck: z.string().nullable(),
  Origination: z.string().nullable(),
  PaymentDate: z.string(),
  PaymentID: z.number(),
  PaymentMethodID: z.number(),
  PaymentType: z.string(),
  PaymentTypeIdentifier: z.string(),
  PersonID: z.number(),
  ProcessDate: z.string().nullable(),
  ProcessTime: z.string(),
  ProcessorTransactionID: z.number().nullable(),
  ReceiptDate: z.string().nullable(),
  ReferenceNo: z.string(),
  RefundedAmount: z.number(),
  Status: z.string(),
  TransactionID: z.string(),
  TransactionType: z.string(),
  Type: z.string(),
  UnappliedAmount: z.number(),
  Username: z.string(),
  VoidDate: z.string().nullable(),
  Voidable: z.boolean(),
})

export type Transaction = z.infer<typeof Transaction>

const orderInvoiceSchema = z.object({
  ConsultantInfo: z.object({
    Email: z.string(),
    PhoneNumber: z.string(),
  }),
  CustomerInfo: z.object({
    FirstName: z.string(),
    LastName: z.string(),
  }),
  OrderInfo: z.object({
    Value: z.object({
      AddressCount: z.number(),
      AllowChangeCommissionDate: z.boolean(),
      AllowChangeCommissionOwner: z.boolean(),
      AllowChangeParty: z.boolean(),
      AllowChangeShipHoldStatus: z.boolean(),
      AllowUpdateOrder: z.boolean(),
      BalanceDueAfterPayments: z.number(),
      BalanceDueAfterPaymentsRefundsCreditMemos: z.number(),
      BusinessUnitID: z.number().nullable(),
      CommissionDate: z.string().datetime(),
      CommissionOwnerDisplayID: z.string(),
      CommissionOwnerDisplayName: z.string(),
      CommissionOwnerLink: z.string(),
      CommissionOwnerPersonTypeID: z.number(),
      CommissionOwnerPersonTypeName: z.string(),
      Commissionable: z.boolean(),
      ConsultantPrice: z.number(),
      CurrencyCulture: z.string(),
      CurrencySymbol: z.string().nullable(),
      CurrencyTypeID: z.number(),
      DiscountTotal: z.number(),
      DisplayID: z.string(),
      EventDisplayID: z.string().nullable(),
      EventOwnerDisplayID: z.string().nullable(),
      GrandTotal: z.number(),
      HandlingMethodEnabled: z.boolean(),
      HandlingMethodID: z.number().nullable(),
      HandlingMethodPrice: z.number(),
      HandlingOverridePrice: z.number().nullable(),
      HandlingPrice: z.number(),
      IsHostOrder: z.boolean(),
      LegalEntityPaymentMethodID: z.number(),
      Locked: z.boolean(),
      OrderAddress: z.object({
        AddressID: z.number(),
        City: z.string(),
        Company: z.string().nullable(),
        FirstName: z.string(),
        LastName: z.string(),
        LastName2: z.string(),
        MiddleName: z.string().nullable(),
        NickName: z.string().nullable(),
        PhoneNumber: z.string().nullable(),
        PostalCode: z.string(),
        Province: z.object({
          Abbreviation: z.string(),
          CountryID: z.number(),
          CountryName: z.string(),
          Name: z.string(),
          ProvinceID: z.number(),
        }),
        ProvinceID: z.number(),
        Street1: z.string(),
        Street2: z.string().nullable(),
        Street3: z.string().nullable(),
        Street4: z.string().nullable(),
      }),
      OrderDate: z.string().datetime(),
      OrderID: z.number(),
      OrderLines: z.array(
        z.object({
          BuildableKitOrderLineID: z.number().nullable(),
          CouponCode: z.string(),
          CouponID: z.number().nullable(),
          CurrencySymbol: z.string().nullable(),
          CurrencyTypeID: z.number(),
          Discounts: z.number(),
          DisplayName: z.string(),
          GiftCards: z.array(z.string()),
          HandlingPrice: z.number(),
          HasPersonalizations: z.boolean(),
          IsBuildable: z.boolean(),
          Kits: z.array(
            z.object({
              DisplayName: z.string().nullable(),
              Name: z.string(),
              Quantity: z.number(),
            })
          ),
          LinePrice: z.number(),
          LineTax: z.number(),
          LineTotal: z.number(),
          OrderID: z.number(),
          OrderLineID: z.number(),
          OrderLineStatusID: z.number(),
          OrderLineStatusName: z.string(),
          OverridePrice: z.number().nullable(),
          OverrideQuantity: z.number(),
          OverrideTax: z.number().nullable(),
          PartyHostRewardGroupRewardID: z.number().nullable(),
          Price: z.number(),
          PriceRuleID: z.number(),
          ProductBusinessUnitID: z.number().nullable(),
          ProductID: z.number(),
          ProductVariationOptionsDelimited: z.boolean().nullable(),
          PromotionalRewardGroupRewardID: z.number().nullable(),
          Quantity: z.number(),
          SKU: z.string(),
          SequenceNumber: z.number(),
          ShippingPrice: z.number(),
          Subtotal: z.number(),
          Tax: z.number(),
          TrackingNumberLinks: z.array(z.string()),
          TrackingNumbers: z.array(z.string()),
          WarehouseBinDisplayID: z.string(),
          WarehouseName: z.string(),
        })
      ),
      OrderOwnerDisplayID: z.string(),
      OrderOwnerDisplayName: z.string(),
      OrderOwnerLink: z.string(),
      OrderOwnerPersonTypeID: z.number(),
      OrderOwnerPersonTypeName: z.string(),
      OrderPaymentStatusID: z.number(),
      OrderStatusID: z.number(),
      OrderStatusName: z.string(),
      OrderTaxTotals: z.array(
        z.object({
          CountryTaxID: z.number().nullable(),
          OrderID: z.number(),
          ProvinceTaxID: z.number().nullable(),
          Tax: z.number(),
          TaxName: z.string(),
          Taxable: z.number(),
        })
      ),
      OrderTotal: z.number(),
      OrderVolumeTotals: z.array(
        z.object({
          OrderID: z.number(),
          TotalDiscounts: z.number(),
          TotalRefunds: z.number(),
          TotalVolume: z.number(),
          VolumeTypeAbbreviation: z.string(),
          VolumeTypeDisplayOrder: z.number(),
          VolumeTypeID: z.number(),
          VolumeTypeName: z.string(),
        })
      ),
      PersonID: z.number(),
      PostedDate: z.string().datetime(),
      RecommendedByPersonDisplayID: z.string().nullable(),
      RecommendedByPersonDisplayName: z.string(),
      RecommendedByPersonLink: z.string(),
      RecommendedByPersonTypeID: z.number().nullable(),
      RecommendedByPersonTypeName: z.string().nullable(),
      ShipHold: z.boolean(),
      ShipmentCount: z.number(),
      ShippingMethodID: z.number(),
      ShippingMethodName: z.string(),
      ShippingMethodPrice: z.number(),
      ShippingOverridePrice: z.number().nullable(),
      ShippingPrice: z.number(),
      ShippingWeight: z.number(),
      ShoppingCartID: z.number(),
      ShoppingCartName: z.string(),
      SubscriptionIDs: z.array(z.number()).nullable(),
      SubscriptionRunDate: z.string().datetime().nullable(),
      Subtotal: z.number(),
      TaxID: z.number(),
      TaxTotal: z.number(),
      TotalCreditMemos: z.number(),
      TotalPayments: z.number(),
      TotalRefunds: z.number(),
      Transactions: z.array(Transaction),
    }),
  }),
})

export type OrderInvoiceSchema = z.infer<typeof orderInvoiceSchema>

export const getOrderInvoice: QueryFunction<OrderInvoiceSchema | null, string[]> = async ({
  queryKey,
}) => {
  try {
    const orderDisplayId = queryKey[1]
    const response = await api('consultant/invoice/info', {
      method: 'get',
      searchParams: { OrderDisplayId: orderDisplayId },
    }).json<OrderInvoiceSchema>()

    return response
  } catch {
    return null
  }
}

export const ORDER_INVOICE_QUERY_KEY = 'order-invoice'
export const useOrderInvoiceQuery = (orderDisplayId: string) =>
  useQuery({ queryFn: getOrderInvoice, queryKey: [ORDER_INVOICE_QUERY_KEY, orderDisplayId] })
