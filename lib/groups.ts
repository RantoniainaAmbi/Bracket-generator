import { Group, GroupMatch, GroupStanding, Team } from "@/types"
import { v4 as uuidv4 } from "uuid"

export function generateGroups(teams: Team[], groupCount: number): Group[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  const groups: Group[] = []

  for (let i = 0; i < groupCount; i++) {
    const groupTeams = shuffled.filter((_, index) => index % groupCount === i)
    groups.push({
      id: uuidv4(),
      name: `Groupe ${String.fromCharCode(65 + i)}`, 
      teams: groupTeams,
      matches: generateGroupMatches(groupTeams),
      standings: initStandings(groupTeams),
    })
  }

  return groups
}

function generateGroupMatches(teams: Team[]): GroupMatch[] {
  const matches: GroupMatch[] = []

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: uuidv4(),
        teamA: teams[i],
        teamB: teams[j],
        scoreA: null,
        scoreB: null,
        played: false,
      })
    }
  }

  return matches
}

function initStandings(teams: Team[]): GroupStanding[] {
  return teams.map((team) => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }))
}

export function updateGroupMatch(
  group: Group,
  matchId: string,
  scoreA: number,
  scoreB: number
): Group {
  const updatedMatches = group.matches.map((match) => {
    if (match.id !== matchId) return match
    return { ...match, scoreA, scoreB, played: true }
  })

  const updatedStandings = recalculateStandings(group.teams, updatedMatches)

  return {
    ...group,
    matches: updatedMatches,
    standings: updatedStandings,
  }
}

function recalculateStandings(teams: Team[], matches: GroupMatch[]): GroupStanding[] {
  const standings = initStandings(teams)

  for (const match of matches) {
    if (!match.played || match.scoreA === null || match.scoreB === null) continue

    const a = standings.find((s) => s.team.id === match.teamA.id)!
    const b = standings.find((s) => s.team.id === match.teamB.id)!

    a.played++
    b.played++
    a.goalsFor += match.scoreA
    a.goalsAgainst += match.scoreB
    b.goalsFor += match.scoreB
    b.goalsAgainst += match.scoreA

    if (match.scoreA > match.scoreB) {
      a.won++; a.points += 3
      b.lost++
    } else if (match.scoreA < match.scoreB) {
      b.won++; b.points += 3
      a.lost++
    } else {
      a.drawn++; a.points++
      b.drawn++; b.points++
    }
  }

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const diffA = a.goalsFor - a.goalsAgainst
    const diffB = b.goalsFor - b.goalsAgainst
    if (diffB !== diffA) return diffB - diffA
    return b.goalsFor - a.goalsFor
  })
}

export function getQualified(groups: Group[], perGroup: number): Team[] {
  if (perGroup !== 2 || groups.length % 2 !== 0) {
    return groups.flatMap((group) =>
      group.standings.slice(0, perGroup).map((s) => s.team)
    )
  }

  const qualified: Team[] = []

  for (let i = 0; i < groups.length; i += 2) {
    const groupA = groups[i]
    const groupB = groups[i + 1]

    const A1 = groupA.standings[0].team
    const A2 = groupA.standings[1].team
    const B1 = groupB.standings[0].team
    const B2 = groupB.standings[1].team

    qualified.push(A1, B2, B1, A2)
  }

  return qualified
}