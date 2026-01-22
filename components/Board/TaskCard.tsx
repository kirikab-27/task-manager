'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types/task'
import { Calendar, Clock, Tag as TagIcon, MoreHorizontal, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors = {
    1: 'border-l-gray-400',
    2: 'border-l-blue-400',
    3: 'border-l-green-400',
    4: 'border-l-yellow-400',
    5: 'border-l-red-400',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm ${
        isDragging ? 'dragging opacity-50' : ''
      } border-l-4 ${priorityColors[task.priority as keyof typeof priorityColors]}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
        <button className="rounded p-1 hover:bg-accent">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.dueDate), 'M/d', { locale: ja })}</span>
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
            <TagIcon className="h-3 w-3" />
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: tag.color || undefined }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {task.status === 'done' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>完了</span>
        </div>
      )}
    </div>
  )
}