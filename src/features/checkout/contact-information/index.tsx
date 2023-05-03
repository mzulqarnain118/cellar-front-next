import { useCallback, useEffect, useMemo } from 'react'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox, Collapse, TextInput, Textarea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useCheckoutActions, useCheckoutTabs } from '@/lib/stores/checkout'

const giftMessageFormSchema = z.object({
  giftMessage: z
    .string()
    .min(1, { message: 'Please enter a gift message.' })
    .max(250, { message: 'Your gift message cannot exceed 250 characters.' }),
  isGift: z.boolean(),
  recipientEmail: z.string().min(1, { message: "Please enter the recipient's email." }),
})

type GiftMessageFormSchema = z.infer<typeof giftMessageFormSchema>

export const ContactInformation = () => {
  const { data: session } = useSession()
  const { data: consultant } = useConsultantQuery()
  const { completedTabs } = useCheckoutTabs()
  const { setActiveTab, setCompletedTabs } = useCheckoutActions()
  const isComplete = completedTabs.includes('contact-information')
  const [opened, { toggle }] = useDisclosure(false)
  const [isGift, { toggle: toggleIsGift }] = useDisclosure(false)

  const options: UseFormProps<GiftMessageFormSchema> = useMemo(
    () => ({
      defaultValues: {
        giftMessage: '',
        isGift,
        recipientEmail: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(giftMessageFormSchema),
    }),
    [isGift]
  )
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<GiftMessageFormSchema>(options)

  const onSubmit: SubmitHandler<GiftMessageFormSchema> = useCallback(data => {
    console.log(data)
  }, [])

  useEffect(() => {
    if ((isGift && isSubmitSuccessful) || !isGift) {
      setCompletedTabs(prev => [...prev, 'contact-information'])
      setActiveTab('delivery')
    } else if (isGift && !isSubmitSuccessful) {
      setCompletedTabs(prev => prev.filter(tab => tab !== 'contact-information'))
      setActiveTab('contact-information')
    }
  }, [isGift, isSubmitSuccessful, setActiveTab, setCompletedTabs])

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
          1. Contact information
        </Typography>
        <ChevronDownIcon className="h-6 w-6" />
      </div>

      <Collapse className="!m-0 p-4" in={opened} transitionDuration={300}>
        <div className="relative space-y-4">
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
              <Button className="ml-auto mt-2 flex lg:ml-0" type="submit">
                Add gift message
              </Button>
            </Collapse>
          </form>
        </div>
      </Collapse>
    </>
  )
}
