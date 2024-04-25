import { UnitedStatesFlag } from './united-states'

interface Map {
  [origin: string]: JSX.Element
}

const FlagMap: Map = {
  California: <UnitedStatesFlag />,
  USA: <UnitedStatesFlag />,
  UnitedStates: <UnitedStatesFlag />,
  Washington: <UnitedStatesFlag />,
}

interface Props {
  origin: string
}

/**
 * Renders the corresponding product's origin flag.
 * @return React component
 */
export const ProductOriginFlag = ({ origin }: Props) => FlagMap[origin] || null
