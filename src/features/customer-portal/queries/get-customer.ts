import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'

interface CustomerNote {
  CreatedByPersonDisplayName: string | null
  DateCreated: string
  DisplayInPortal: boolean
  DisplayMessage: boolean
  EntityDisplayID: string | null
  EntityTypeID: number
  MarkedAsRead: boolean
  NoteID: number
  NoteTypeID: number
  NoteTypeName: string | null
  Subject: string
  Text: string
  ViewableByCreatedPersonOnly: boolean
  ViewedInPortal: boolean
}

interface CustomerParent {
  GenealogyTypeAbbreviation: string | null
  GenealogyTypeName: string | null
  PersonDisplayID: string | null
  PersonName: string | null
  PersonTypeID: number
  isBinary: boolean
  BinaryPlacementOption: number | null
  BinaryLeg: boolean
}

interface CustomerPhone {
  LegalEntityPhoneID: number
  LegalEntityID: number
  PhoneTypeID: number
  PhoneTypeName: string | null
  PhoneNumber: string | null
  Primary: boolean
  SortOrder: number | null
  ModificationState: number
}

interface CustomField {
  CustomFieldID: number
  Name: string | null
  Description: string | null
  CustomFieldTypeID: number
  Editable: boolean
  Required: boolean
  DisplayOrder: number
  DisplayValue: string | null
  StringValue: string | null
  BooleanValue: boolean | null
  DateTimeValue: string | null
  DecimalValue: number | null
  CustomFieldSelectOptionID: number | null
  TextboxMaxLength: number
  TextboxMask: string | null
  CheckboxDefaultChecked: boolean
  NumericInputDefault: number | null
  NumericInputMinValue: number | null
  NumericInputMaxValue: number | null
  NumericInputDecimalPlaces: number
  DateTimeMinValue: string | null
  DateTimeMaxValue: string | null
  DateTimeAccuracy: number
  DateTimeRestrictionType: number
  SelectOptions:
    | { CustomFieldSelectOptionID: number; Description: string | null; Deletable: boolean }[]
    | null
}

export interface CustomerAddress {
  AddressID: number
  FirstName: string | null
  LastName: string | null
  LastName2: string | null
  Company: string | null
  NickName: string | null
  City: string | null
  DisplayName: string | null
  CountryID: number | null
  CountryName: string | null
  CountryTwoLetterISO: string | null
  PhoneNumberFormat: string | null
  ProvinceID: number | null
  County: string | null
  PostalCode: string | null
  ProvinceAbbreviation: string | null
  ProvinceName: string | null
  Street1: string | null
  Street2: string | null
  Street3: string | null
  Street4: string | null
  Region: string | null
  DeliveryOffice: string | null
  Residential: boolean
  IsValid: boolean | null
  Primary: boolean
  Mailing: boolean
  IsNexus: boolean
  PhoneNumber: string | null
  PersonID?: number
  PersonDisplayID?: string | null
  PersonTypeID?: number
  SpecialInstructions?: string | null
  DisplayPostalCode?: boolean
  DisplayStreet3?: boolean
  DisplayStreet4?: boolean
  DisplayRegion?: boolean
  DisplayDeliveryOffice?: boolean
  DisplayLastName2?: boolean
}

export interface CustomerCreditCard {
  PersonDisplayID: string | null
  PaymentToken: string | null
  CreditCardTypeID: number
  CreditCardTypeName: string | null
  NameOnCard: string | null
  CardNumber: string | null
  DisplayNumber: string | null
  ExpirationMonth: string | null
  ExpirationYear: string | null
  DefaultPaymentMethod: boolean
  AddressID: number
  CVV: string | null
  DefaultPaymentMethodYesNo: string | null
  ExpirationDate: string | null
  IsUsed: boolean
  RequireCardNumber: boolean
  GatewayInfoID: number | null
  ProfilePaymentToken: string | null
  ProfilePaymentNonceToken: string | null
  Address: CustomerAddress
}

interface CustomerEcheck {
  PersonDisplayID: string | null
  PaymentToken: string | null
  BankName: string | null
  EcheckAccountTypeID: number
  EcheckAccountTypeName: string | null
  NameOnAccount: string | null
  DisplayNumber: string | null
  RoutingNumber: string | null
  DefaultPaymentMethod: boolean
  AddressID: number
  DefaultPaymentMethodYesNo: string | null
  IsUsed: boolean
  RequireAccountNumber: boolean
  GatewayInfoID: number | null
  ProfilePaymentToken: string | null
  Address: CustomerAddress
}

interface Response {
  Customer_ReferrerName: string | null
  Customer_ReferrerId: string | null
  Person_Name: {
    CompanyName: string | null
    DisplayName: string | null
    FirstName: string | null
    JointFirstName: string | null
    JointLastName: string | null
    JointMiddleName: string | null
    LastName: string | null
    LastName2: string | null
    MiddleName: string | null
    NickName: string | null
  }
  Person_OtherInformation: {
    CancelDate: string | null
    CancelDateProvided: boolean
    ConfirmPassword: string | null
    CustomerTypeID: number
    CustomerTypeName: string | null
    CustomerStatusID: number
    CustomerStatusName: string | null
    BusinessTypeID: number | null
    BusinessUnitID: number | null
    BusinessUnitIDProvided: boolean
    BusinessUnitName: string | null
    DateOfBirth: string | null
    DateOfBirthProvided: boolean
    GenderTypeID: number | null
    IgnoreInactivityCheck: boolean | null
    JoinDate: string | null
    LanguageName: string | null
    Locked: boolean | null
    Password: string | null
    TaxExemptTypeID: number | null
    TranslationLanguageID: number | null
    TranslationLanguageCode: string | null
    UserAccountExists: boolean
    Username: string | null
  }
  Person_Identification: {
    DLCountryID: string | null
    DLNumber: string | null
    DLStateID: number | null
    EIN: string | null
    SIN: string | null
    SSN: string | null
    STAX: string | null
  }
  Person_CreditCards: CustomerCreditCard[] | null
  Person_PrimaryCreditCard: CustomerCreditCard
  Person_Echecks: CustomerEcheck[] | null
  Person_PrimaryEcheck: CustomerEcheck | null
  EmailConfirmationCode: string | null
  AllowCreateCustomer: boolean
  AllowCreateConsultant: boolean
  AllowUpdateCustomer: boolean
  AllowCancelCustomer: boolean
  AllowReactivateCustomer: boolean
  AllowCreateLead: boolean
  AllowCreateOrder: boolean
  DoNotPlaceCustomer: boolean
  ShowNewReferral: boolean
  ReferredCustomerCount: number
  NewReferredCustomers: number
  DaysSinceLastOrder: number
  OrdersThisMonth: number
  BaseResult: unknown
  Person_Accounts:
    | {
        AccountID: number
        AccountTypeID: number
        AccountType: string | null
        DisplayID: string | null
        DateCreated: string
        CustomFieldValues: CustomField[]
      }[]
    | null
  PersonID: number
  DisplayID: string | null
  Person_SponsorName: string | null
  Person_SponsorDisplayId: string | null
  Person_Parents: CustomerParent[] | null
  isBinary: boolean
  Left_Leg: CustomerParent | null
  Right_Leg: CustomerParent | null
  ReferringCustomerDisplayID: string | null
  ReferringCustomerName: string | null
  IpAddress: string | null
  PersonTypeID: number
  Person_ContactInfo: {
    Email: string | null
    OptOutCompanyEmail: boolean
    OptOutCompanyText: boolean
    OptOutConsultantEmail: boolean
    OptOutConsultantText: boolean
    Person_Phones: CustomerPhone[] | null
    Person_PrimaryPhone: CustomerPhone
  }
  Person_Addresses: CustomerAddress[] | null
  Person_CustomFieldValues: CustomField | null
  Person_Notes: CustomerNote[] | null
  Person_Genealogy: {
    GenealogyPlacements: CustomerParent[] | null
    Note: string | null
    PersonDisplayID: string | null
  }
  SpecificBinaryParents:
    | { BinaryLeg: boolean; GenealogyTypeID: number; ParentPersonID: number }[]
    | null
  Person_PrimaryAddress: CustomerAddress
}

export const getCustomer: QueryFunction<Response, string[]> = async ({ queryKey }) => {
  try {
    const displayId = queryKey[1]

    const response = await api('CustomerPortal/GetCustomerForEdit', {
      method: 'get',
      searchParams: { PersonDisplayID: displayId },
    }).json<Response>()

    return response
  } catch {
    throw new Error('')
  }
}

export const CUSTOMER_QUERY_KEY = 'customer'

export const useCustomerQuery = () => {
  const { data: session } = useSession()

  return useQuery({
    queryFn: getCustomer,
    queryKey: [CUSTOMER_QUERY_KEY, session?.user?.displayId || ''],
  })
}
