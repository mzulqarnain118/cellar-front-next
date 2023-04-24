import { PencilIcon } from '@heroicons/react/24/outline'
import { Box, Button, LoaderProps, LoadingOverlay } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

const loaderProps: LoaderProps = {
  color: 'brand.2',
  size: 'lg',
  variant: 'dots',
}

export const Payment = () => {
  const [isEditing, { toggle: toggleEdit }] = useDisclosure()
  const [isOverlayVisible, { toggle: _toggleOverlay }] = useDisclosure(false)

  return (
    <Box pos="relative">
      <LoadingOverlay loaderProps={loaderProps} overlayBlur={1} visible={isOverlayVisible} />
      <div className="flex w-full flex-col rounded border border-neutral-300 bg-neutral-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h6 className="!font-semibold">Payment</h6>
          {!isEditing ? (
            <Button className="btn-sm items-center gap-2" variant="subtle" onClick={toggleEdit}>
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button className="btn-sm" variant="subtle" onClick={toggleEdit}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Box>
  )
}
