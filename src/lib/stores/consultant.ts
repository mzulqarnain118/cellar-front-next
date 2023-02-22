import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CORPORATE_CONSULTANT_ID } from '../constants'
import { Consultant } from '../types'

interface ConsultantStore {
  consultant: Consultant
  setConsultant: (consultant: Consultant) => void
}

export const DEFAULT_CONSULTANT_STATE: Consultant = {
  displayId: CORPORATE_CONSULTANT_ID,
  displayName: '',
  url: '',
}

export const useConsultantStore = create<ConsultantStore>()(
  persist(
    set => ({
      consultant: DEFAULT_CONSULTANT_STATE,
      setConsultant: (consultant: Consultant) => set({ consultant }),
    }),
    { name: 'consultant' }
  )
)
