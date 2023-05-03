import { ReactNode, useCallback } from 'react'

import { ContextModalProps } from '@mantine/modals'

import { Button } from '../../button'

export const ConfirmationModal = ({
  context,
  id,
  innerProps: { body, cancelText, confirmText, onCancel, onConfirm },
}: ContextModalProps<{
  body: ReactNode
  cancelText: string
  confirmText: string
  onCancel: () => void | Promise<void>
  onConfirm: () => void | Promise<void>
}>) => {
  const handleCancel = useCallback(async () => {
    await onCancel()
    context.closeModal(id)
  }, [context, id, onCancel])

  const handleConfirm = useCallback(async () => {
    await onConfirm()
    context.closeModal(id)
  }, [context, id, onConfirm])

  return (
    <>
      {body}
      <div className="mt-4 grid gap-4 lg:flex lg:flex-row-reverse">
        <Button onClick={handleConfirm}>{confirmText}</Button>
        <Button color="ghost" variant="outline" onClick={handleCancel}>
          {cancelText}
        </Button>
      </div>
    </>
  )
}
