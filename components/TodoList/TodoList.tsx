'use client'

import { useState } from 'react'
import { TodoItem } from './TodoItem'
import { TodoFilters } from './TodoFilters'
import { useTaskStore } from '@/stores/taskStore'
import { Plus } from 'lucide-react'

export function TodoList() {
  const { tasks, addTask } = useTaskStore()
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all')
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'todo') return task.status !== 'done'
    if (filter === 'done') return task.status === 'done'
    return true
  })

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      await addTask({ title: newTaskTitle.trim() })
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">TODOリスト</h2>
        <TodoFilters filter={filter} setFilter={setFilter} />
      </div>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <TodoItem key={task.id} task={task} />
        ))}

        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex items-center space-x-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="新しいタスクを入力..."
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              onBlur={() => {
                if (!newTaskTitle.trim()) {
                  setIsAdding(false)
                }
              }}
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              追加
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewTaskTitle('')
              }}
              className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
            >
              キャンセル
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center space-x-2 rounded-md border border-dashed border-muted-foreground/25 py-3 text-sm text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>新しいタスクを追加</span>
          </button>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {filteredTasks.length} 件のタスク
      </div>
    </div>
  )
}