import { SliceZone } from '@prismicio/react'
import { SliceSimulator } from '@slicemachine/adapter-next/simulator'

import { components } from '@/components/slices'

const SliceSimulatorPage = () => (
  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
  <SliceSimulator sliceZone={props => <SliceZone {...props} components={components} />} />
)

export default SliceSimulatorPage
