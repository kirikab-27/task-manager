'use client'

import { useState } from 'react'
import { Search, Plus, Command, Menu } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { searchTasks, addTask } = useTaskStore()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value) {
      searchTasks(e.target.value)
    }
  }

  const handleQuickAdd = async () => {
    const title = prompt('新しいタスクのタイトルを入力してください:')
    if (title) {
      await addTask({ title })
    }
  }

  return (
    <header className="border-b border-border bg-card px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-accent md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Task Manager</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="タスクを検索... (/))"
              value={searchQuery}
              onChange={handleSearch}
              className="h-10 w-48 md:w-64 lg:w-80 rounded-md border border-input bg-background px-10 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </div>

          <button
            onClick={handleQuickAdd}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">新規タスク</span>
          </button>

          <button className="hidden sm:inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
            <Command className="mr-2 h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  )
}