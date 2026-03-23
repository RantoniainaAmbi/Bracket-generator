export type Team = {
  id: string
  name: string
}

export type Match = {
  id: string
  teamA: Team | null
  teamB: Team | null
  scoreA: number | null
  scoreB: number | null
  winner: Team | null
  round: number
}

export type Bracket = {
  rounds: Match[][]
}

export type GroupMatch = {
  id: string
  teamA: Team
  teamB: Team
  scoreA: number | null
  scoreB: number | null
  played: boolean
}

export type GroupStanding = {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type Group = {
  id: string
  name: string
  teams: Team[]
  matches: GroupMatch[]
  standings: GroupStanding[]
}

export type TournamentFormat = "elimination" | "groups"

export type Tournament = {
  id: string
  name: string
  format: TournamentFormat
  teams: Team[]
  bracket?: Bracket
  groups?: Group[]
}