import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Tournament, Team } from "@/types"

type TournamentStore = {
  tournament: Tournament | null
  setTournament: (tournament: Tournament) => void
  updateTeams: (teams: Team[]) => void
  resetTournament: () => void
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      tournament: null,

      setTournament: (tournament) => set({ tournament }),

      updateTeams: (teams) =>
        set((state) => ({
          tournament: state.tournament
            ? { ...state.tournament, teams }
            : null,
        })),

      resetTournament: () => set({ tournament: null }),
    }),
    {
      name: "bracket-tournament", 
    }
  )
)