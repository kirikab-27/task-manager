'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import { BoardColumn as BoardColumnType, Task } from '@/types/task'
import { MoreVertical, Plus } from 'lucide-react'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const taskCount = tasks.length

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-80 flex-col rounded-lg bg-muted/50"
    >
      <div
        className="flex items-center justify-between rounded-t-lg px-4 py-3"
        style={{
          backgroundColor: column.color || '#e2e8f0',
        }}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm">{column.name}</h3>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium">
            {taskCount}
          </span>
          {column.wipLimit && taskCount >= column.wipLimit && (
            <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              WIP制限
            </span>
          )}
        </div>
        <button className="rounded p-1 hover:bg-white/20">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>

      <button className="flex items-center justify-center space-x-2 rounded-b-lg border-t border-border p-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <Plus className="h-4 w-4" />
        <span>タスクを追加</span>
      </button>
    </div>
  )
}