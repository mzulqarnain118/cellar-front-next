import { HintProps } from '@blacklab/react-image-magnify'
import { MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'

import { Button } from '@/core/components/button'

const startIcon = <MagnifyingGlassPlusIcon className="h-4 w-4" />

export const Hint = ({ hintTextMouse, hintTextTouch, isMouseDetected }: HintProps) => (
  <div className="inline-flex items-center justify-center w-full -translate-y-[-1rem]">
    <Button className="mx-auto" color="ghost" size="sm" startIcon={startIcon} variant="outline">
      {isMouseDetected ? hintTextMouse : hintTextTouch}
    </Button>
  </div>
)
