import { PrismicRichText } from '@prismicio/react'
import { useHits } from 'react-instantsearch'

import { ConsultantHit } from '@/features/create-account/consultant/search'

import Hit from './hit'

interface HitsProps {
  consultantInputValue: string
  setConsultantInputValue: (consultant: string) => void
  zeroResultDescription: any
}

const Hits: React.FC<HitsProps> = ({
  consultantInputValue,
  zeroResultDescription,
  setConsultantInputValue,
}) => {
  const { hits } = useHits<ConsultantHit>()

  if (consultantInputValue) {
    return (
      <div className="hits">
        {hits.map(hit => (
          <Hit key={hit.DisplayID} hit={hit} setConsultantInputValue={setConsultantInputValue} />
        ))}
      </div>
    )
  } else {
    return <PrismicRichText field={zeroResultDescription} />
  }
}

export default Hits
