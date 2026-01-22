'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import { BoardColumn as BoardColumnType, Task } from '@/types/task'
import { MoreVertical, Plus } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })
  const { addTask } = useTaskStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const taskCount = tasks.length

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    await addTask({
      title: newTaskTitle.trim(),
      boardColumnId: column.id,
      status: column.name === '完了' ? 'done' : column.name === '進行中' ? 'in_progress' : 'todo',
    })

    setNewTaskTitle('')
    setIsAdding(false)
  }

  const handleCancel = () => {
    setNewTaskTitle('')
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddTask()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

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
            {isAdding && (
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <input
                  type="text"
                  placeholder="タスクのタイトルを入力..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    disabled={!newTaskTitle.trim()}
                  >
                    追加
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded px-3 py-1 text-xs font-medium hover:bg-muted"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center space-x-2 rounded-b-lg border-t border-border p-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          <span>タスクを追加</span>
        </button>
      )}
    </div>
  )
}