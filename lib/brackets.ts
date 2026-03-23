import { Match, Bracket, Team } from "@/types"
import { v4 as uuidv4 } from "uuid"

function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)))
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

export function generateBracket(teams: Team[]): Bracket {
  const shuffled = shuffle(teams)
  const size = nextPowerOfTwo(shuffled.length)

  const padded: (Team | null)[] = [
    ...shuffled,
    ...Array(size - shuffled.length).fill(null),
  ]

  const firstRound: Match[] = []
  for (let i = 0; i < padded.length; i += 2) {
    const teamA = padded[i]
    const teamB = padded[i + 1]

    const winner = teamB === null ? teamA : teamA === null ? teamB : null

    firstRound.push({
      id: uuidv4(),
      teamA,
      teamB,
      scoreA: null,
      scoreB: null,
      winner,
      round: 1,
    })
  }

  const rounds: Match[][] = [firstRound]
  let currentSize = size / 2

  while (currentSize > 1) {
    currentSize = currentSize / 2
    const round = rounds.length + 1
    const emptyMatches: Match[] = Array(currentSize)
      .fill(null)
      .map(() => ({
        id: uuidv4(),
        teamA: null,
        teamB: null,
        scoreA: null,
        scoreB: null,
        winner: null,
        round,
      }))
    rounds.push(emptyMatches)
  }

  return { rounds }
}

export function updateBracket(bracket: Bracket, matchId: string, scoreA: number, scoreB: number): Bracket {
  const rounds = bracket.rounds.map((round) => [...round])

  let updatedMatch: Match | null = null
  let roundIndex = -1
  let matchIndex = -1

  for (let r = 0; r < rounds.length; r++) {
    for (let m = 0; m < rounds[r].length; m++) {
      if (rounds[r][m].id === matchId) {
        const match = rounds[r][m]
        const winner = scoreA > scoreB ? match.teamA : match.teamB

        rounds[r][m] = { ...match, scoreA, scoreB, winner }
        updatedMatch = rounds[r][m]
        roundIndex = r
        matchIndex = m
        break
      }
    }
  }

  if (updatedMatch && roundIndex < rounds.length - 1) {
    const nextMatchIndex = Math.floor(matchIndex / 2)
    const nextMatch = rounds[roundIndex + 1][nextMatchIndex]

    if (matchIndex % 2 === 0) {
      rounds[roundIndex + 1][nextMatchIndex] = {
        ...nextMatch,
        teamA: updatedMatch.winner,
      }
    } else {
      rounds[roundIndex + 1][nextMatchIndex] = {
        ...nextMatch,
        teamB: updatedMatch.winner,
      }
    }
  }

  return { rounds }
}