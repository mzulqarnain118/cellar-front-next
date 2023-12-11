import { useCallback, useEffect, useMemo } from 'react'

import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Collapse } from '@mantine/core'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/form'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Input } from '@/core/components/input'
import { Textarea } from '@/core/components/textarea'
import { Typography } from '@/core/components/typogrpahy'
import { useCartQuery } from '@/lib/queries/cart'
import {
  useCheckoutActions,
  useCheckoutErrors,
  useCheckoutGiftMessage,
  useCheckoutGiftMessageCheckbox,
  useCheckoutIsAddingGiftMessage,
  useCheckoutIsEditingGiftMessage,
  useCheckoutIsGift,
} from '@/lib/stores/checkout'

import { useAddGiftMessageMutation } from '../../mutations/add-gift-message'

import { ContactInformationRefs } from '.'

const giftMessageFormSchema = z.object({
  giftMessage: z
    .string()
    .min(1, { message: 'Please enter a gift message.' })
    .max(250, { message: 'Your gift message cannot exceed 250 characters.' }),
  recipientEmail: z.string()
})

type GiftMessageFormSchema = z.infer<typeof giftMessageFormSchema>

interface GiftMessageFormProps {
  refs: ContactInformationRefs
}

export const GiftMessageForm = ({ refs }: GiftMessageFormProps) => {
  const errors = useCheckoutErrors()
  const isAddingGiftMessage = useCheckoutIsAddingGiftMessage()
  const isEditingGiftMessage = useCheckoutIsEditingGiftMessage()
  const giftMessageCheckbox = useCheckoutGiftMessageCheckbox()
  const isGift = useCheckoutIsGift()
  const giftMessage = useCheckoutGiftMessage()
  const { setIsGift, setGiftMessageCheckbox, toggleIsAddingGiftMessage, toggleIsEditingGiftMessage } = useCheckoutActions()
  const { mutate: addGiftMessage } = useAddGiftMessageMutation()
  const open = isAddingGiftMessage || isEditingGiftMessage || giftMessage.message.length > 0
  const { data: cartData } = useCartQuery()
  const hasGiftCard = cartData?.items[0]?.isGiftCard

  const defaultValues: GiftMessageFormSchema = useMemo(
    () => ({
      giftMessage: giftMessage.message,
      recipientEmail: giftMessage.recipientEmail,
    }),
    [giftMessage]
  )

  const onSubmit: SubmitHandler<GiftMessageFormSchema> = useCallback(
    ({ giftMessage: message, recipientEmail }) => {
      console.log('isEditingGiftMessage: ', isEditingGiftMessage)
      console.log('isAddingGiftMessage: ', isAddingGiftMessage)

      if (isAddingGiftMessage) {

        if (giftMessage.message !== message || giftMessage.recipientEmail !== recipientEmail) {
          addGiftMessage({ message, recipientEmail })
        }

        toggleIsAddingGiftMessage()
      }

      if (isEditingGiftMessage) {

        if (giftMessage.message !== message || giftMessage.recipientEmail !== recipientEmail) {
          addGiftMessage({ message, recipientEmail })
        }

        toggleIsEditingGiftMessage()
      }

    },
    [addGiftMessage, giftMessage.message, giftMessage.recipientEmail, toggleIsAddingGiftMessage, toggleIsEditingGiftMessage, isAddingGiftMessage, isEditingGiftMessage]
  )

  useEffect(() => {
    setIsGift(!!giftMessage.message.length)
  }, [giftMessage.message.length, isGift, setIsGift])


  return (
    <>
      <Checkbox
        checked={giftMessageCheckbox}
        color="dark"
        // disabled={!!giftMessage.message.length || false}
        label="Is this a gift?"
        onClick={() => {
          setGiftMessageCheckbox(!!!giftMessageCheckbox)
        }}
      />
      <Collapse in={open}>
        <div className="relative">
          {isAddingGiftMessage || isEditingGiftMessage ? (
            <Form defaultValues={defaultValues} schema={giftMessageFormSchema} onSubmit={onSubmit}>
              {hasGiftCard &&
                <Input
                  ref={refs.recipientEmailRef}
                  label="Recipient email"
                  name="recipientEmail"
                  size="sm"
                />}
              <Textarea
                ref={refs.giftMessageRef}
                label="Gift message"
                maxLength={251}
                name="giftMessage"
                size="sm"
              />

              <Button dark className="ml-auto mt-2 flex lg:ml-0" type="submit">
                {giftMessage.message ? "Update" : "Add"} gift message
              </Button>
              {errors?.contactInformation ? (
                <Typography className="mt-4 block text-error">
                  {errors.contactInformation}
                </Typography>
              ) : undefined}
            </Form>
          ) : (

            <>
              {hasGiftCard && <Typography noSpacing as="p" className="text-14 font-bold">
                Recipient email
              </Typography>}
              <Typography noSpacing as="p">
                {giftMessage.recipientEmail}
              </Typography>
              <Typography noSpacing as="p" className="mt-2 text-14 font-bold">
                Gift message
              </Typography>
              <Typography noSpacing as="p">
                {giftMessage.message}
              </Typography>
            </>
          )}
          {giftMessage.message.length ? (
            <Button
              className="absolute right-0 top-0 gap-2"
              color="ghost"
              size="sm"
              onClick={toggleIsEditingGiftMessage}
            >
              {isAddingGiftMessage || isEditingGiftMessage ? (
                <>
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  Edit gift message
                </>
              )}
            </Button>
          ) : undefined}
        </div>
      </Collapse>
    </>
  )
}
