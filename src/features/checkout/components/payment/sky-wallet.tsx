import { ChangeEventHandler, FocusEventHandler, useCallback, useMemo, useState } from 'react'

import { CurrencyDollarIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Popover } from '@mantine/core'
import { useDisclosure, useInputState } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useCheckoutActions, useCheckoutAppliedSkyWallet } from '@/lib/stores/checkout'

const accountCreditIcon = <CurrencyDollarIcon className="mx-3 w-4 h-4" />

export const SkyWallet = ({ skyWallet, skyWalletFetching, skyWalletLoading, cartTotalData }) => {
  console.log('🚀 ~ SkyWal ~ skyWallet:', skyWallet)
  // const { data: skyWallet, isFetching: skyWalletFetching, isLoading: skyWalletLoading } = useSkyWalletQuery()

  const [tooltipOpened, { close: closeTooltip, open: openTooltip }] = useDisclosure(false)

  const appliedSkyWallet = useCheckoutAppliedSkyWallet()
  const { setAppliedSkyWallet } = useCheckoutActions()

  // const orderTotal = useMemo(() => {
  //   const total = cart?.prices.orderTotal || 0

  //   if (total - appliedSkyWallet <= 0) {
  //     return 0
  //   }
  //   return total - appliedSkyWallet
  // }, [appliedSkyWallet, cart?.prices.orderTotal])

  // const eligibleBalance = useMemo(() => {
  //   const balance = skyWallet?.reduce((total, balance) => {
  //     console.log('🚀 ~ skyWallet?.reduce ~ balance:', balance)
  //     console.log('🚀 ~ skyWallet?.reduce ~ total:', total)
  //     return balance.BalanceAvailableToUse + total
  //   }, 0)

  //   console.log('🚀 ~ eligibleBalance ~ balance - appliedSkyWallet:', balance - appliedSkyWallet)
  //   console.log('🚀 ~ eligibleBalance ~ appliedSkyWallet:', appliedSkyWallet)

  //   if (appliedSkyWallet > 0 && balance - appliedSkyWallet <= 0) {
  //     return 0
  //   } else if (appliedSkyWallet > 0 && balance - appliedSkyWallet >= cartTotalData?.orderTotal) {
  //     return cartTotalData?.orderTotal
  //   }
  //   return balance - appliedSkyWallet
  // }, [appliedSkyWallet, cartTotalData?.orderTotal, skyWallet])

  // const eligibleBalancee = useMemo(()=> {

  // })

  const eligibleBalance = useMemo(() => {
    const balanceAvailableToUse = skyWallet?.reduce(
      (total, balance) => balance.BalanceAvailableToUse + total,
      0
    )

    const balance = balanceAvailableToUse - appliedSkyWallet

    if (balance >= cartTotalData?.orderTotal) {
      return cartTotalData?.orderTotal
    }

    return balance
  }, [appliedSkyWallet, cartTotalData?.orderTotal, skyWallet])

  const [value, setValue] = useInputState(0)
  const [error, setError] = useState<string | undefined>()

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      const newValue = event.target.value

      if (/^[0-9]*(\.)?([0-9])?([0-9])?$/.test(newValue)) {
        const numberValue = parseFloat(newValue)

        setValue(numberValue || 0)

        if (numberValue > eligibleBalance) {
          setError('Value cannot be greater than the eligible balance.')
        } else if (numberValue > cartTotalData?.orderTotal) {
          setError('Value cannot be greater than the order total.')
        } else {
          setError(undefined)
        }
      }
    },
    [eligibleBalance, cartTotalData?.orderTotal, setValue]
  )

  const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(() => {
    setValue(eligibleBalance)
  }, [eligibleBalance, setValue])

  const handleApply = useCallback(() => {
    if (value >= 0 && error === undefined) {
      setAppliedSkyWallet(parseFloat(value.toString()))
    }
  }, [error, setAppliedSkyWallet, value])

  const accountCreditSubmit = useMemo(
    () => (
      <Button dark className="h-10 rounded-l-none" size="sm" type="button" onClick={handleApply}>
        Apply
      </Button>
    ),
    [handleApply]
  )

  if (skyWalletLoading || skyWalletFetching) {
    return (
      <div className="grid gap-0.5">
        <div className="h-[1.375rem] animate-pulse rounded bg-neutral-300" />
        <div className="h-10 animate-pulse rounded bg-neutral-300" />
      </div>
    )
  }

  if (skyWallet !== undefined && !eligibleBalance && appliedSkyWallet === 0) {
    return <></>
  }

  return (
    <div className="flex items-start">
      <div className="grid">
        <Input
          noSpacing
          error={error}
          inputMode="decimal"
          instructionLabel={`Eligible balance: ${formatCurrency(eligibleBalance)}`}
          label="Account credit"
          left={accountCreditIcon}
          name="accountCredit"
          pattern="[0-9]+"
          right={accountCreditSubmit}
          size="sm"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {appliedSkyWallet ? (
          <Typography className="text-success">
            {formatCurrency(appliedSkyWallet)} Sky Wallet applied.
          </Typography>
        ) : undefined}
      </div>
      <Popover
        withArrow
        withinPortal
        arrowSize={16}
        opened={tooltipOpened}
        position="top"
        shadow="md"
        width={200}
      >
        <Popover.Target>
          <button onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
            <InformationCircleIcon className="w-5 h-5 text-info" />
          </button>
        </Popover.Target>
        <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
          <Typography className="text-sm">
            Eligible Balance reflects the amount you can use for qualifying items in the cart. Gift
            cards may not be used for shipping, sales tax or merchandise. Some exclusions may apply.
          </Typography>
        </Popover.Dropdown>
      </Popover>
    </div>
  )
}
