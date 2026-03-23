"use client"

import { useRouter } from "next/navigation"
import { useTournamentStore } from "@/lib/store"
import { updateBracket } from "@/lib/brackets"
import { Match } from "@/types"
import { useState } from "react"

export default function TournamentPage() {
  const router = useRouter()
  const { tournament, setTournament, resetTournament } = useTournamentStore()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")

  if (!tournament || !tournament.bracket) {
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

  const { bracket } = tournament
  const champion = bracket.rounds.at(-1)?.[0]?.winner

  function openModal(match: Match) {
    if (!match.teamA || !match.teamB || match.winner) return
    setSelectedMatch(match)
    setScoreA("")
    setScoreB("")
  }

  function closeModal() {
    setSelectedMatch(null)
    setScoreA("")
    setScoreB("")
  }

function handleSubmitScore() {
  if (!selectedMatch || scoreA === "" || scoreB === "") return
  const a = parseInt(scoreA)
  const b = parseInt(scoreB)
  if (isNaN(a) || isNaN(b) || a === b) return

  const currentTournament = tournament
  if (!currentTournament?.bracket) return

  const updated = updateBracket(currentTournament.bracket, selectedMatch.id, a, b)
  setTournament({ ...currentTournament, bracket: updated })
  closeModal()
}

  function handleReset() {
    resetTournament()
    router.push("/")
  }

  const roundLabels = (total: number, index: number) => {
    if (index === total - 1) return "Finale"
    if (index === total - 2) return "Demi-finales"
    if (index === total - 3) return "Quarts de finale"
    return `Tour ${index + 1}`
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Élimination directe</p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-800 px-4 py-2 rounded-lg"
        >
          Nouveau tournoi
        </button>
      </div>

      {champion && (
        <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
          <p className="text-yellow-400 text-sm font-medium mb-1">🏆 Champion</p>
          <p className="text-3xl font-bold text-yellow-300">{champion.name}</p>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {bracket.rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="flex flex-col gap-4">

              <p className="text-center text-sm font-medium text-gray-400 mb-2">
                {roundLabels(bracket.rounds.length, roundIndex)}
              </p>

              <div
                className="flex flex-col justify-around"
                style={{ minHeight: `${bracket.rounds[0].length * 100}px` }}
              >
                {round.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => openModal(match)}
                    className={`w-48 bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                      match.teamA && match.teamB && !match.winner
                        ? "border-violet-500/50 hover:border-violet-400 cursor-pointer hover:scale-105"
                        : "border-gray-800 cursor-default"
                    }`}
                  >
                    <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-800 ${
                      match.winner?.id === match.teamA?.id ? "bg-violet-600/20" : ""
                    }`}>
                      <span className={`text-sm truncate ${
                        match.teamA ? "text-white" : "text-gray-600"
                      }`}>
                        {match.teamA?.name ?? "—"}
                      </span>
                      {match.scoreA !== null && (
                        <span className="text-sm font-bold ml-2 text-white">{match.scoreA}</span>
                      )}
                    </div>

                    <div className={`flex items-center justify-between px-3 py-2 ${
                      match.winner?.id === match.teamB?.id ? "bg-violet-600/20" : ""
                    }`}>
                      <span className={`text-sm truncate ${
                        match.teamB ? "text-white" : "text-gray-600"
                      }`}>
                        {match.teamB?.name ?? "—"}
                      </span>
                      {match.scoreB !== null && (
                        <span className="text-sm font-bold ml-2 text-white">{match.scoreB}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-6">
            <h2 className="text-lg font-semibold text-center">Saisir le score</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium flex-1 truncate">{selectedMatch.teamA?.name}</span>
                <input
                  type="number"
                  min="0"
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium flex-1 truncate">{selectedMatch.teamB?.name}</span>
                <input
                  type="number"
                  min="0"
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {scoreA !== "" && scoreB !== "" && parseInt(scoreA) === parseInt(scoreB) && (
                <p className="text-red-400 text-xs text-center">
                  Pas d'égalité en élimination directe
                </p>
              )}
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
                disabled={scoreA === "" || scoreB === "" || parseInt(scoreA) === parseInt(scoreB)}
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