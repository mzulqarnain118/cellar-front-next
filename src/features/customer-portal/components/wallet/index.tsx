import { ChangeEventHandler, useCallback, useMemo, useState } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Table, Tabs, TabsPanelProps } from '@mantine/core'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'

import { useRedeemGiftCardMutation } from '../../mutations/redeem-gift-card'
import { useRedeemOfferMutation } from '../../mutations/redeem-offer'
import { useSkywalletQuery } from '../../queries/skywallet'

export const Wallet = (props: TabsPanelProps) => {
  const { data: skywallet } = useSkywalletQuery()
  const { mutate: redeemGiftCard } = useRedeemGiftCardMutation()
  const { mutate: redeemOffer } = useRedeemOfferMutation()

  const [giftCard, setGiftCard] = useState('')
  const [couponCode, setCouponCode] = useState('')

  const accountCredits = useMemo(
    () =>
      skywallet?.sorted_transactions && skywallet?.sorted_transactions.length
        ? skywallet?.sorted_transactions.map(transaction => ({
            ...transaction,
            Amount: `$${transaction.Amount}`,
            Balance: `$${transaction.Balance}`,
            TransactionDate: format(parseISO(transaction.TransactionDate), 'PPPPpp'),
          }))
        : [],
    [skywallet?.sorted_transactions]
  )

  const coupons = useMemo(
    () =>
      skywallet?.Coupons && skywallet?.Coupons.length
        ? skywallet?.Coupons.map(coupon => ({
            ...coupon,
            DateAdded: format(parseISO(coupon.DateAdded), 'PPPPpp'),
            EndDateTime: format(parseISO(coupon.EndDateTime), 'PPPPpp'),
            NumberUsed: `${coupon.NumberUsed} / ${coupon.MaxUsesPerPerson || '-'}`,
            StartDateTime: format(parseISO(coupon.StartDateTime), 'PPPPpp'),
          }))
        : [],
    [skywallet?.Coupons]
  )

  const accountCreditRows = useMemo(
    () =>
      accountCredits.map(credit => (
        <tr key={credit.SkyWalletTransactionID}>
          <td>{credit.TransactionDate}</td>
          <td>{credit.Details}</td>
          <td>{credit.name}</td>
          <td>{credit.Amount}</td>
        </tr>
      )),
    [accountCredits]
  )

  const couponRows = useMemo(
    () =>
      coupons.map(coupon => (
        <tr key={coupon.DateAdded}>
          <td>{coupon.PromotionalRewardName}</td>
          <td>{coupon.CouponCode}</td>
          <td>{coupon.StartDateTime}</td>
          <td>{coupon.EndDateTime}</td>
          <td>{coupon.NumberUsed}</td>
        </tr>
      )),
    [coupons]
  )

  const handleGiftCardChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    setGiftCard(event.target.value)
  }, [])

  const handleCouponCodeChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    setCouponCode(event.target.value)
  }, [])

  const handleRedeemGiftCard = useCallback(() => {
    redeemGiftCard({ giftCard })
  }, [giftCard, redeemGiftCard])

  const handleRedeemOffer = useCallback(() => {
    redeemOffer({ couponCode })
  }, [couponCode, redeemOffer])

  return (
    <Tabs.Panel {...props}>
      <div className="space-y-8">
        <div className="grid grid-cols-[auto_1fr] items-start gap-6 rounded border-l-8 border-l-info bg-white px-6 py-8">
          <CheckCircleIcon className="h-9 w-9 text-info-content" />
          <Typography className="text-14 text-neutral-500">
            Your Wallet is used to manage available credits, and offers. Use your Wallet to view
            available balances and transfer balances (where applicable). Open balances will be
            available during order payment processing to use as payments (cash and credits) or
            discounts (offers) on orders.
          </Typography>
        </div>
        <div>
          <div className="flex items-center justify-between rounded-t bg-[#403839] px-7 py-3 text-neutral-50">
            <Typography as="h2" displayAs="h5">
              Account credit - {formatCurrency(skywallet?.AccountCredit)}
            </Typography>
            <div className="flex items-center gap-2">
              <Input
                noSpacing
                aria-label="Gift card code"
                name="giftCardCode"
                placeholder="Enter gift card code"
                value={giftCard}
                onChange={handleGiftCardChange}
              />
              <Button dark onClick={handleRedeemGiftCard}>
                Redeem gift card
              </Button>
            </div>
          </div>
          <div className="rounded-b border border-t-0 border-neutral-light p-3">
            <Table>
              <thead>
                <tr>
                  <th>Transaction date</th>
                  <th>Details</th>
                  <th>Credit type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="bg-[#eae7e8] text-neutral-dark">
                {accountCreditRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <Typography className="block text-sm">No results found</Typography>
                    </td>
                  </tr>
                ) : (
                  accountCreditRows
                )}
              </tbody>
            </Table>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between rounded-t bg-[#403839] px-7 py-3 text-neutral-50">
            <Typography as="h2" displayAs="h5">
              Offers
            </Typography>
            <div className="flex items-center gap-2">
              <Input
                noSpacing
                aria-label="Offer code"
                name="offerCode"
                placeholder="Enter offer code"
                value={couponCode}
                onChange={handleCouponCodeChange}
              />
              <Button dark onClick={handleRedeemOffer}>
                Redeem offer
              </Button>
            </div>
          </div>
          <div className="rounded-b border border-t-0 border-neutral-light p-3">
            <Table>
              <thead>
                <tr>
                  <th>Date added</th>
                  <th>Offer name</th>
                  <th>Offer code</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th># of uses</th>
                </tr>
              </thead>
              <tbody className="bg-[#eae7e8] text-neutral-dark">
                {couponRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <Typography className="block text-sm">No results found</Typography>
                    </td>
                  </tr>
                ) : (
                  couponRows
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </Tabs.Panel>
  )
}
