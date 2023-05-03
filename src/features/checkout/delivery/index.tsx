import { useState } from 'react'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Collapse, Tabs } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'
import { useCheckoutTabs } from '@/lib/stores/checkout'

import { ShipToHome } from './ship-to-home'

const tabsClassNames = { tabLabel: 'text-md' }

export const Delivery = () => {
  const { completedTabs } = useCheckoutTabs()
  const isComplete = completedTabs.includes('contact-information')
  const [opened, { toggle }] = useDisclosure(!isComplete)
  const [value, setValue] = useState<string | null>('shipToHome')

  return (
    <>
      <div
        className={clsx(
          'flex cursor-pointer items-center justify-between rounded p-4',
          !isComplete && '!cursor-not-allowed'
        )}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isComplete) {
            toggle()
          }
        }}
        onKeyDown={() => {
          if (isComplete) {
            toggle()
          }
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          2. Delivery
        </Typography>
        <ChevronDownIcon className="h-6 w-6" />
      </div>

      <Collapse className="!m-0 p-4" in={opened} transitionDuration={300}>
        <div>
          <Tabs
            classNames={tabsClassNames}
            color="dark"
            keepMounted={false}
            value={value}
            variant="pills"
            onTabChange={setValue}
          >
            <Tabs.List grow className="h-14 rounded border border-base-dark">
              <Tabs.Tab className="font-bold uppercase" value="shipToHome">
                Ship to home
              </Tabs.Tab>
              <Tabs.Tab className="font-bold uppercase" value="pickUp">
                Pick up
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel className="mt-4" value="shipToHome">
              <ShipToHome />
            </Tabs.Panel>
            <Tabs.Panel className="mt-4" value="pickUp">
              Second panel
            </Tabs.Panel>
          </Tabs>
        </div>
        {/* <div className="relative space-y-4">
          <div>
            <Typography as="p">{session?.user?.fullName}</Typography>
            <Typography as="p">{session?.user?.email}</Typography>
            <Typography as="p">
              You&apos;re shopping with: <strong>{consultant.displayName || consultant.url}</strong>
            </Typography>
          </div>
          <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <Checkbox
              label="Is this a gift?"
              {...register('isGift', {
                onChange: event => {
                  toggleIsGift()

                  if (!event.target.checked) {
                    reset()
                  }
                },
              })}
            />
            <Collapse in={isGift}>
              <TextInput
                error={errors.recipientEmail?.message}
                label="Recipient email"
                size="sm"
                {...register('recipientEmail')}
              />
              <Textarea
                error={errors.giftMessage?.message}
                label="Gift message"
                maxLength={251}
                minRows={3}
                {...register('giftMessage')}
              />
              <Button className="mt-2" type="submit">
                Add gift message
              </Button>
            </Collapse>
          </form>
        </div> */}
      </Collapse>
    </>
  )
  // return (
  // <div className="cursor-auto rounded border border-base-dark bg-neutral-50">
  //   {/* Trigger. */}
  //   <div
  //     className={clsx(
  //       'flex cursor-pointer items-center justify-between rounded p-4',
  //       !isComplete && '!cursor-not-allowed'
  //     )}
  //     role="button"
  //     tabIndex={0}
  //     onClick={() => {
  //       if (isComplete) {
  //         toggle()
  //       }
  //     }}
  //     onKeyDown={() => {
  //       if (isComplete) {
  //         toggle()
  //       }
  //     }}
  //   >
  //     <Typography
  //       noSpacing
  //       as="h2"
  //       className="!font-body !text-lg !font-bold lg:!text-2xl"
  //       displayAs="h3"
  //     >
  //       2. Delivery
  //     </Typography>
  //     <ChevronDownIcon className="h-6 w-6" />
  //   </div>

  //   <Collapse className="p-4" in={opened} transitionDuration={300}>
  //     <Tabs color="dark" keepMounted={false} value={value} variant="pills" onTabChange={setValue}>
  //       <Tabs.List>
  //         <Tabs.Tab value="shipToHome">Ship-to-home</Tabs.Tab>
  //         <Tabs.Tab value="pickUp">Pick-up</Tabs.Tab>
  //       </Tabs.List>

  //       <Tabs.Panel className="mt-4" value="shipToHome">
  //         <ShipToHome />
  //       </Tabs.Panel>
  //       <Tabs.Panel className="mt-4" value="pickUp">
  //         Second panel
  //       </Tabs.Panel>
  //     </Tabs>
  //   </Collapse>
  // </div>
  // )
}
