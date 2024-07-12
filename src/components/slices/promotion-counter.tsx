import type { Content } from '@prismicio/client'
import { SliceComponentProps } from '@prismicio/react'

import Counter from '@/components/CountdownTimer'

type PromotionCounterProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyPromotionCountdownTimerSlice>

export const PromotionCounter = ({ slice }: PromotionCounterProps) => <Counter slice={slice} />
