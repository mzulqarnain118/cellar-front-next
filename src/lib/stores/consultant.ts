import { create } from 'zustand'

import { CORPORATE_CONSULTANT_ID } from '../constants'
import { Consultant } from '../types'

interface ConsultantStore {
  consultant: Consultant
  resetConsultant: () => void
  setConsultant: (consultant: Consultant) => void
}

export const DEFAULT_CONSULTANT_STATE: Consultant = {
  displayId: CORPORATE_CONSULTANT_ID,
  displayName: '',
  url: '',
}

export const useConsultantStore = create<ConsultantStore>()(set => ({
  consultant: DEFAULT_CONSULTANT_STATE,
  resetConsultant: () => set({ consultant: DEFAULT_CONSULTANT_STATE }),
  setConsultant: (consultant: Consultant) => set({ consultant }),
}))
