import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Equipe, MembreEquipe } from '@/lib/types'

interface TeamState {
  currentTeam: Equipe | null
  currentMembership: MembreEquipe | null
  teams: Equipe[]
  setCurrentTeam: (team: Equipe, membership: MembreEquipe) => void
  setTeams: (teams: Equipe[]) => void
  clearTeam: () => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      currentTeam: null,
      currentMembership: null,
      teams: [],
      setCurrentTeam: (team, membership) =>
        set({ currentTeam: team, currentMembership: membership }),
      setTeams: (teams) => set({ teams }),
      clearTeam: () => set({ currentTeam: null, currentMembership: null }),
    }),
    {
      name: 'team-storage',
    }
  )
)