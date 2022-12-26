import { SliceZone } from '@prismicio/react'
import { SliceSimulator } from '@prismicio/slice-simulator-react'

import state from '.slicemachine/libraries-state.json'
import { components } from '@/components/slices'

const SliceSimulatorPage = () => (
  <SliceSimulator
    sliceZone={({ slices }) => <SliceZone components={components} slices={slices} />}
    state={state}
  />
)

export default SliceSimulatorPage
