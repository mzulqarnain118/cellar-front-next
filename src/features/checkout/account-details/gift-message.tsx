import { useCallback, useMemo } from 'react'

import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Collapse,
  Group,
  Modal,
  ModalBaseCloseButtonProps,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAddGiftMessageMutation } from '@/lib/mutations/checkout/add-gift-message'
import { useCheckoutActions, useCheckoutGiftMessage } from '@/lib/stores/checkout'

const giftMessageSchema = z.object({
  isChecked: z.boolean(),
  message: z.string().min(1, { message: 'Please enter a gift message.' }),
  recipientEmail: z
    .string()
    .email("Please enter the recipient's email.")
    .min(1, { message: "Please enter the recipient's email." }),
})

type GiftMessageSchema = z.infer<typeof giftMessageSchema>

interface GiftMessageProps {
  editing?: boolean
  toggleEdit: () => void
  toggleOverlay: () => void
}

export const GiftMessage = ({ toggleEdit, toggleOverlay }: GiftMessageProps) => {
  const giftMessage = useCheckoutGiftMessage()
  const { resetGiftMessage } = useCheckoutActions()
  const [warningModalOpened, { close, open }] = useDisclosure()

  const disclosureOptions = useMemo(
    () => ({
      onClose: () => {
        if (giftMessage.message) {
          open()
        }
      },
    }),
    [giftMessage.message, open]
  )
  const [isGift, { toggle: toggleIsGift }] = useDisclosure(!!giftMessage.message, disclosureOptions)

  const addGiftMessageMutationOptions = useMemo(
    () => ({
      onMutate: () => {
        toggleOverlay()
      },
      onSettled: () => {
        toggleOverlay()
        toggleEdit()
      },
    }),
    [toggleEdit, toggleOverlay]
  )

  const { mutateAsync: addGiftMessage } = useAddGiftMessageMutation(addGiftMessageMutationOptions)

  const formOptions: UseFormProps<GiftMessageSchema> = useMemo(
    () => ({
      defaultValues: {
        message: giftMessage?.message,
        recipientEmail: giftMessage?.recipientEmail,
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(giftMessageSchema),
    }),
    [giftMessage?.message, giftMessage?.recipientEmail]
  )

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<GiftMessageSchema>(formOptions)

  const onSubmit: SubmitHandler<GiftMessageSchema> = useCallback(
    async ({ message, recipientEmail }) => {
      await addGiftMessage({ message, recipientEmail })
    },
    [addGiftMessage]
  )

  const closeButtonProps: ModalBaseCloseButtonProps = useMemo(() => ({ size: 'lg' }), [])

  const onYesClick = useCallback(() => {
    resetGiftMessage()
    setValue('message', '')
    setValue('recipientEmail', '')
    close()

    notifications.show({
      color: 'success',
      icon: <CheckIcon className="h-4 w-4" />,
      message: 'Your gift message updated successfully.',
    })
  }, [close, resetGiftMessage, setValue])

  const onCancelClick = useCallback(() => {
    toggleIsGift()
    close()
  }, [close, toggleIsGift])

  return (
    <>
      <Modal.Root centered opened={warningModalOpened} onClose={close}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center gap-2 text-red-700">
              <ExclamationTriangleIcon className="h-8 w-8" />
              <Modal.Title className="h5">Warning</Modal.Title>
            </div>
            <Modal.CloseButton {...closeButtonProps} />
          </Modal.Header>
          <Modal.Body>
            <Text>Are you sure you want to remove your gift message?</Text>
            <Group className="pt-4">
              <button className="btn-error btn-sm btn" onClick={onYesClick}>
                Yes
              </button>
              <button className="btn-ghost btn-sm btn" onClick={onCancelClick}>
                Cancel
              </button>
            </Group>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <div className="pt-4">
        <div className="form-control">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={isGift}
              className="checkbox-primary checkbox checkbox-xs rounded"
              type="checkbox"
              onClick={toggleIsGift}
              {...register('isChecked')}
            />
            <span>This is a gift</span>
          </label>
        </div>
        <Collapse in={isGift}>
          <form className="pt-2" onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              required
              error={errors.recipientEmail?.message}
              label="Recipient email"
              type="email"
              {...register('recipientEmail')}
            />
            <Textarea
              autosize
              required
              className="pt-4"
              error={errors.message?.message}
              label="Your gift message"
              minRows={2}
              {...register('message')}
            />
            <button className="btn-primary btn-sm btn mt-2" type="submit">
              Save
            </button>
          </form>
        </Collapse>
      </div>
    </>
  )
}
