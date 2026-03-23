"use client"

import { useRouter } from "next/navigation"
import { useTournamentStore } from "@/lib/store"
import { updateGroupMatch, getQualified } from "@/lib/groups"
import { generateBracket } from "@/lib/brackets"
import { Group, GroupMatch } from "@/types"
import { useState } from "react"

export default function GroupsPage() {
  const router = useRouter()
  const { tournament, setTournament, resetTournament } = useTournamentStore()
  const [selectedMatch, setSelectedMatch] = useState<{ match: GroupMatch; groupId: string } | null>(null)
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")

  if (!tournament || !tournament.groups) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Aucun tournoi en cours.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-violet-600 hover:bg-violet-500 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Créer un tournoi
          </button>
        </div>
      </main>
    )
  }

  const { groups } = tournament
  const allPlayed = groups.every((g) => g.matches.every((m) => m.played))

  function openModal(match: GroupMatch, groupId: string) {
    if (match.played) return
    setSelectedMatch({ match, groupId })
    setScoreA("")
    setScoreB("")
  }

  function closeModal() {
    setSelectedMatch(null)
    setScoreA("")
    setScoreB("")
  }

function handleSubmitScore() {
  if (!selectedMatch || scoreA === "" || scoreB === "" || !tournament) return
  const a = parseInt(scoreA)
  const b = parseInt(scoreB)
  if (isNaN(a) || isNaN(b)) return

  const updatedGroups = tournament.groups!.map((g) =>
    g.id === selectedMatch.groupId
      ? updateGroupMatch(g, selectedMatch.match.id, a, b)
      : g
  )

  setTournament({ ...tournament, groups: updatedGroups })
  closeModal()
}

function handleGoToBracket() {
  if (!tournament) return
  const qualified = getQualified(groups, 2)
  const bracket = generateBracket(qualified)
  setTournament({ ...tournament, bracket })
  router.push("/tournament")
}

  function handleReset() {
    resetTournament()
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Phase de poules</p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-800 px-4 py-2 rounded-lg"
        >
          Nouveau tournoi
        </button>
      </div>

      {allPlayed && (
        <div className="mb-8 bg-violet-500/10 border border-violet-500/30 rounded-2xl p-6 text-center space-y-3">
          <p className="text-violet-300 font-medium">
            Tous les matchs sont joués !
          </p>
          <p className="text-gray-400 text-sm">
            Les 2 premiers de chaque poule passent en élimination directe.
          </p>
          <button
            onClick={handleGoToBracket}
            className="bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Lancer le bracket final →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onMatchClick={(match) => openModal(match, group.id)}
          />
        ))}
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-6">
            <h2 className="text-lg font-semibold text-center">Saisir le score</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium flex-1 truncate">
                  {selectedMatch.match.teamA.name}
                </span>
                <input
                  type="number"
                  min="0"
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium flex-1 truncate">
                  {selectedMatch.match.teamB.name}
                </span>
                <input
                  type="number"
                  min="0"
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitScore}
                disabled={scoreA === "" || scoreB === ""}
                className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function GroupCard({ group, onMatchClick }: { group: Group; onMatchClick: (match: GroupMatch) => void }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="font-semibold text-lg">{group.name}</h2>
      </div>

      <div className="px-5 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Classement</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs">
              <th className="text-left pb-2 font-medium">Équipe</th>
              <th className="text-center pb-2 font-medium">J</th>
              <th className="text-center pb-2 font-medium">G</th>
              <th className="text-center pb-2 font-medium">N</th>
              <th className="text-center pb-2 font-medium">P</th>
              <th className="text-center pb-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((s, index) => (
              <tr
                key={s.team.id}
                className={`border-t border-gray-800 ${index < 2 ? "text-white" : "text-gray-500"}`}
              >
                <td className="py-1.5 flex items-center gap-2">
                  {index < 2 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                  )}
                  <span className="truncate">{s.team.name}</span>
                </td>
                <td className="text-center py-1.5">{s.played}</td>
                <td className="text-center py-1.5">{s.won}</td>
                <td className="text-center py-1.5">{s.drawn}</td>
                <td className="text-center py-1.5">{s.lost}</td>
                <td className="text-center py-1.5 font-bold">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Matchs</p>
        {group.matches.map((match) => (
          <div
            key={match.id}
            onClick={() => onMatchClick(match)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
              match.played
                ? "bg-gray-800/50 cursor-default"
                : "bg-gray-800 hover:bg-gray-700 cursor-pointer"
            }`}
          >
            <span className={`flex-1 truncate ${match.played ? "text-gray-500" : "text-white"}`}>
              {match.teamA.name}
            </span>
            <span className="mx-3 font-bold text-gray-400 shrink-0">
              {match.played ? `${match.scoreA} - ${match.scoreB}` : "vs"}
            </span>
            <span className={`flex-1 text-right truncate ${match.played ? "text-gray-500" : "text-white"}`}>
              {match.teamB.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}