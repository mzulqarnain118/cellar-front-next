import { Collapse } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { Button } from '@/core/components/button'

export const Payment = () => {
  const [opened, { toggle }] = useDisclosure(false)

  return (
    <div className="">
      {/* Trigger. */}
      <div>
        <Button onClick={toggle}>Payment</Button>
      </div>

      <Collapse in={opened}>Hey</Collapse>
    </div>
  )
}
