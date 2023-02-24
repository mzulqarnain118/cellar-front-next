import { SliceZone } from '@prismicio/react'
import type { SliceSimulatorProps } from '@prismicio/slice-simulator-react'

import { components } from '@/components/slices'

export const SliceZoneSimulator: SliceSimulatorProps['sliceZone'] = ({ slices }) => (
  <SliceZone components={components} slices={slices} />
)
