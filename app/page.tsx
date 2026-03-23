"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTournamentStore } from "@/lib/store"
import { generateBracket } from "@/lib/brackets"
import { generateGroups } from "@/lib/groups"
import { Team, TournamentFormat } from "@/types"
import { v4 as uuidv4 } from "uuid"
import { DraggableTeamList } from "@/components/DraggableTeamList"

export default function Home() {
  const router = useRouter()
  const { setTournament } = useTournamentStore()

  const [name, setName] = useState("")
  const [format, setFormat] = useState<TournamentFormat>("elimination")
  const [teamInput, setTeamInput] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [groupCount, setGroupCount] = useState(2)

  function addTeam() {
    const trimmed = teamInput.trim()
    if (!trimmed || teams.find((t) => t.name === trimmed)) return
    setTeams([...teams, { id: uuidv4(), name: trimmed }])
    setTeamInput("")
  }

  function removeTeam(id: string) {
    setTeams(teams.filter((t) => t.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addTeam()
  }

  function handleCreate() {
    if (!name.trim() || teams.length < 2) return

    if (format === "elimination") {
      setTournament({
        id: uuidv4(),
        name,
        format,
        teams,
        bracket: generateBracket(teams),
      })
      router.push("/tournament")
    } else {
      setTournament({
        id: uuidv4(),
        name,
        format,
        teams,
        groups: generateGroups(teams, groupCount),
      })
      router.push("/groups")
    }
  }

  const canCreate = name.trim().length > 0 && teams.length >= 2

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">🏆 Bracket Generator</h1>
          <p className="text-gray-400">Crée et gère tes tournois en quelques secondes</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-6 border border-gray-800">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Nom du tournoi</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Championnat Été 2025"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Format</label>
            <div className="grid grid-cols-2 gap-3">
              {(["elimination", "groups"] as TournamentFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    format === f
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {f === "elimination" ? "⚡ Élimination directe" : "🔵 Phase de poules"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {format === "elimination"
                ? "Chaque défaite élimine l'équipe. Le bracket est généré selon l'ordre des équipes ci-dessous."
                : "Les équipes s'affrontent dans des poules. Les 2 premiers de chaque poule se qualifient pour le bracket final."}
            </p>
          </div>

          {format === "groups" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Nombre de poules
              </label>
              <select
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {[2, 3, 4, 6, 8].map((n) => (
                  <option key={n} value={n}>{n} poules</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Équipes <span className="text-gray-500">({teams.length} ajoutées)</span>
              </label>

              {format === "elimination" && teams.length >= 2 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeams((prev) => [...prev].sort(() => Math.random() - 0.5))}
                    className="text-xs px-3 py-1.5 rounded-lg border bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400 transition-all"
                  >
                    🔀 Aléatoire
                  </button>
                  <div className="text-xs px-3 py-1.5 rounded-lg border border-violet-500 text-violet-400 bg-violet-500/10">
                    ⠿ Drag & drop
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nom de l'équipe..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={addTeam}
                className="bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Ajouter
              </button>
            </div>

            {teams.length > 0 && (
              <DraggableTeamList
                teams={teams}
                onReorder={setTeams}
                onRemove={removeTeam}
              />
            )}

            {format === "elimination" && teams.length >= 2 && (
              <p className="text-xs text-gray-500">
                Glisse les équipes pour définir l'ordre du bracket, ou utilise le tirage aléatoire. L'équipe en position 1 affronte la position 2, la 3 affronte la 4, etc.
              </p>
            )}

            {format === "groups" && teams.length >= 2 && (
              <p className="text-xs text-gray-500">
                Les équipes sont réparties automatiquement en {groupCount} poules de manière aléatoire.
              </p>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="w-full py-3 rounded-xl font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 active:scale-95"
          >
            Créer le tournoi →
          </button>

        </div>
      </div>
    </main>
  )
}