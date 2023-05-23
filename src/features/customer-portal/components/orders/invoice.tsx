import { Fragment, useCallback, useMemo, useRef } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { DocumentIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { Table, Tabs, TabsPanelProps } from '@mantine/core'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Divider } from 'react-daisyui'
import { IReactToPrintProps, useReactToPrint } from 'react-to-print'

import { CompanyLogo } from '@/components/company-logo'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { LOCAL_PICK_UP_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'

import { Transaction, useOrderInvoiceQuery } from '../../queries/order-invoice'

const printerIcon = <PrinterIcon className="h-4 w-4" />
const documentIcon = <DocumentIcon className="h-4 w-4" />

export const OrderInvoicePanel = (props: TabsPanelProps) => {
  const { query } = useRouter()
  const { data: invoice, isFetching, isLoading } = useOrderInvoiceQuery(query.slug?.[1] || '')
  const componentRef = useRef<HTMLDivElement | null>(null)
  const printProps: IReactToPrintProps = useMemo(
    () => ({
      content: () => componentRef.current,
    }),
    []
  )
  const handlePrint = useReactToPrint(printProps)

  const handleSavePDF = useCallback(async () => {
    const element = componentRef.current

    if (element !== null) {
      const canvas = await html2canvas(element)
      const data = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'landscape',
      })
      const imgProperties = pdf.getImageProperties(data)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width

      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('print.pdf')
    }
  }, [])

  const tableHeadings = useMemo(
    () => (
      <tr className="text-left">
        <th>Description</th>
        <th>SKU</th>
        <th>Status</th>
        <th>Price</th>
        <th>QTY</th>
        <th>Line Total</th>
      </tr>
    ),
    []
  )

  const tableRows = useMemo(
    () =>
      invoice?.OrderInfo?.Value?.OrderLines.map(product => (
        <tr key={product.SKU}>
          <td>
            <p>{product.DisplayName || ''}</p>
            {product.Kits &&
              product.Kits.map(kit => (
                <Fragment key={kit.DisplayName}>
                  <br />
                  <p>{`- ${kit.Name} (${kit.Quantity})`}</p>
                </Fragment>
              ))}
          </td>
          <td>{product.SKU.toLowerCase() || ''}</td>
          <td>{product.OrderLineStatusName || ''}</td>
          <td>{formatCurrency(product.Price)}</td>
          <td>{product.Quantity}</td>
          <td>{formatCurrency(product.Price * product.Quantity)}</td>
        </tr>
      )),
    [invoice?.OrderInfo?.Value?.OrderLines]
  )

  const updateSkyWallet = useCallback((transactions: Transaction[]) => {
    const skyWallet = { Amount: 0, PaymentDate: '', PaymentType: 'Account Credit' }

    const newTransaction = transactions.reduce<Transaction[]>((result, item) => {
      if (item.PaymentType === 'Sky Wallet Payment') {
        skyWallet.Amount += item.Amount
        skyWallet.PaymentDate = item.PaymentDate
        return result
      } else {
        return [...result, item]
      }
    }, [])

    return skyWallet.Amount ? [...newTransaction, skyWallet] : newTransaction
  }, [])

  const paymentBody = useMemo(
    () =>
      invoice?.OrderInfo?.Value?.Transactions &&
      updateSkyWallet(invoice.OrderInfo.Value.Transactions).map((item: Partial<Transaction>) => (
        <tr key={item.TransactionID}>
          <td>{format(parseISO(item.PaymentDate || ''), 'M/d/yyyy')}</td>
          <td>
            {item.PaymentType === 'Account Credit'
              ? item.PaymentType
              : item.PaymentType === 'Refund'
              ? 'Refunded'
              : `${item.PaymentTypeIdentifier} ${item.CardType} ending in ${item.Last4Digits}`}
          </td>
          <td>{formatCurrency(item.Amount || 0)}</td>
        </tr>
      )),
    [invoice?.OrderInfo.Value.Transactions, updateSkyWallet]
  )

  if (isFetching || isLoading) {
    return <>Loading...</>
  }

  return (
    <Tabs.Panel {...props}>
      <div ref={componentRef} className="print:m-8" id="divToPrint">
        <Head>
          <style media="print" type="text/css">
            {
              '\
                @page { size: landscape; }\
              '
            }
          </style>
        </Head>
        <Typography as="h5">Invoice</Typography>
        <div className="mt-4 space-y-4">
          <div className="grid xl:grid-cols-[1fr_auto]">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-y-2 xl:grid-cols-3">
                <div className="grid">
                  <Typography className="font-bold">Order #</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.DisplayID}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Order date</Typography>
                  <Typography>
                    {format(parseISO(invoice?.OrderInfo?.Value?.OrderDate || ''), 'M/d/yyyy')}
                  </Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Shipping method</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.ShippingMethodName}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Shipping weight</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.ShippingWeight}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Customer name</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.OrderOwnerDisplayName}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Customer #</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.OrderOwnerDisplayID}</Typography>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 xl:grid-cols-3">
                <div className="grid">
                  <Typography className="font-bold">Consultant name</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.CommissionOwnerDisplayName}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Consultant #</Typography>
                  <Typography>{invoice?.OrderInfo?.Value?.CommissionOwnerDisplayID}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Consultant email</Typography>
                  <Typography>{invoice?.ConsultantInfo?.Email}</Typography>
                </div>
                <div className="grid">
                  <Typography className="font-bold">Consultant phone</Typography>
                  <Typography>{invoice?.ConsultantInfo?.PhoneNumber}</Typography>
                </div>
              </div>
            </div>

            <div className="my-8">
              <CompanyLogo className="mx-auto my-4" />
              <div className="grid rounded border border-neutral-light p-4 shadow-lg">
                <Typography as="h6" className="mb-2 border-b border-neutral-light pb-2">
                  {invoice?.OrderInfo?.Value?.ShippingMethodID === LOCAL_PICK_UP_SHIPPING_METHOD_ID
                    ? 'Pick up'
                    : 'Ship to'}
                </Typography>
                <Typography className="text-neutral-600">
                  {invoice?.OrderInfo?.Value?.OrderAddress.Street1}
                </Typography>
                {invoice?.OrderInfo?.Value?.OrderAddress.Street2 ? (
                  <Typography className="text-neutral-600">
                    {invoice?.OrderInfo?.Value?.OrderAddress.Street2}
                  </Typography>
                ) : undefined}
                <Typography className="text-neutral-600">
                  {invoice?.OrderInfo?.Value?.OrderAddress.City},{' '}
                  {invoice?.OrderInfo?.Value?.OrderAddress.Province.Name}{' '}
                  {invoice?.OrderInfo?.Value?.OrderAddress.PostalCode}
                </Typography>
              </div>
            </div>
          </div>
          <Divider />
          <Table>
            <thead>{tableHeadings}</thead>
            <tbody>{tableRows}</tbody>
          </Table>
          <div className="print:break-after-page" />
          <div className="print:mt-8 xl:grid xl:grid-cols-2 xl:items-start xl:gap-4">
            <Table>
              <thead>
                <tr>
                  <th>Payment date</th>
                  <th>Payment type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>{paymentBody}</tbody>
            </Table>
            <div className="space-y-4 text-14 font-bold">
              <div className="flex items-center justify-between">
                <Typography>Subtotal</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.Subtotal)}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Shipping</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.ShippingPrice)}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Retail delivery fee</Typography>
                <Typography>
                  {formatCurrency(invoice?.OrderInfo?.Value?.HandlingMethodPrice)}
                </Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Discount</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.DiscountTotal)}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Estimated sales tax</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.TaxTotal)}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Order total</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.OrderTotal)}</Typography>
              </div>
              <Divider />
              <div className="flex items-center justify-between">
                <Typography>Payments</Typography>
                <Typography>{formatCurrency(invoice?.OrderInfo?.Value?.TotalPayments)}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography>Balance due</Typography>
                <Typography>
                  {formatCurrency(invoice?.OrderInfo?.Value?.BalanceDueAfterPayments)}
                </Typography>
              </div>
              <Divider />
              <Typography as="p" className="text-right text-18 font-normal">
                Thank you for your purchase!
              </Typography>
            </div>
          </div>
        </div>
        <Divider />
      </div>
      <div className="flex flex-col gap-4 print:hidden xl:flex-row xl:justify-end">
        <Button color="ghost" startIcon={printerIcon} onClick={handlePrint}>
          Print
        </Button>
        <Button dark startIcon={documentIcon} onClick={handleSavePDF}>
          Save as PDF
        </Button>
      </div>
    </Tabs.Panel>
  )
}
