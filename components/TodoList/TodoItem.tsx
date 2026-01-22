'use client'

import { useState } from 'react'
import { Task } from '@/types/task'
import { useTaskStore } from '@/stores/taskStore'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash2,
  Star,
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TodoItemProps {
  task: Task
}

export function TodoItem({ task }: TodoItemProps) {
  const { updateTask, deleteTask, completeTask } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleToggleComplete = async () => {
    if (task.status === 'done') {
      await updateTask(task.id, { status: 'todo', completedAt: null })
    } else {
      await completeTask(task.id)
    }
  }

  const handleEdit = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      await updateTask(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('このタスクを削除しますか？')) {
      await deleteTask(task.id)
    }
  }

  const priorityColors = {
    1: 'text-gray-400',
    2: 'text-blue-400',
    3: 'text-green-400',
    4: 'text-yellow-400',
    5: 'text-red-400',
  }

  return (
    <div
      className={`group flex items-center space-x-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-md ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0"
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit()
              if (e.key === 'Escape') {
                setEditTitle(task.title)
                setIsEditing(false)
              }
            }}
            className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        ) : (
          <div
            className={`text-sm ${
              task.status === 'done' ? 'line-through' : ''
            }`}
          >
            {task.title}
          </div>
        )}

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {task.priority && (
            <div className="flex items-center gap-1">
              <Star className={`h-3 w-3 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
              <span>優先度 {task.priority}</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(task.dueDate), 'M月d日', { locale: ja })}
              </span>
            </div>
          )}

          {task.estimatedMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedMinutes}分</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded p-1 hover:bg-accent"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}