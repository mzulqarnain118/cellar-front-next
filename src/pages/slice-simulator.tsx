import { SliceSimulator } from '@prismicio/slice-simulator-react'

import state from '.slicemachine/libraries-state.json'
import { SliceZoneSimulator } from 'prismic/slice-zone-simulator'

const SliceSimulatorPage = () => <SliceSimulator sliceZone={SliceZoneSimulator} state={state} />

export default SliceSimulatorPage
