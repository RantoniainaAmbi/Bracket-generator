"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Team } from "@/types"

function SortableTeam({ team, onRemove }: { team: Team; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2 transition-opacity ${
        isDragging ? "opacity-50 border border-violet-500" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing mr-3 touch-none"
      >
        ⠿
      </button>

      <span className="text-sm flex-1">{team.name}</span>

      <button
        onClick={() => onRemove(team.id)}
        className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </li>
  )
}

export function DraggableTeamList({
  teams,
  onReorder,
  onRemove,
}: {
  teams: Team[]
  onReorder: (teams: Team[]) => void
  onRemove: (id: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = teams.findIndex((t) => t.id === active.id)
    const newIndex = teams.findIndex((t) => t.id === over.id)
    onReorder(arrayMove(teams, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2 mt-3">
          {teams.map((team) => (
            <SortableTeam key={team.id} team={team} onRemove={onRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}