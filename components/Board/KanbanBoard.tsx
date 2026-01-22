'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BoardColumn } from './BoardColumn'
import { TaskCard } from './TaskCard'
import { useTaskStore } from '@/stores/taskStore'
import { useBoardStore } from '@/stores/boardStore'
import { Task } from '@/types/task'

export function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore()
  const { columns } = useBoardStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = active.id as string
    const overColumnId = over.id as string

    // カラムIDを取得（タスクの上にドロップされた場合の処理）
    let targetColumnId = overColumnId
    if (overColumnId.startsWith('task-')) {
      const overTask = tasks.find((t) => t.id === overColumnId)
      if (overTask?.boardColumnId) {
        targetColumnId = overTask.boardColumnId
      }
    }

    // タスクを移動
    await moveTask(activeTaskId, targetColumnId, 0)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.boardColumnId === column.id
          )

          return (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="drag-overlay">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}