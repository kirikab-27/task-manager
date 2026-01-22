'use client'

import { useState, useEffect } from 'react'
import { KanbanBoard } from '@/components/Board/KanbanBoard'
import { TodoList } from '@/components/TodoList/TodoList'
import { CommandPalette } from '@/components/CommandPalette/CommandPalette'
import { Header } from '@/components/Layout/Header'
import { Sidebar } from '@/components/Layout/Sidebar'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTaskStore } from '@/stores/taskStore'
import { useBoardStore } from '@/stores/boardStore'

export default function Home() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [activeSection, setActiveSection] = useState<'focus' | 'tags' | 'todos' | 'settings' | undefined>()
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const { initialize: initializeTasks } = useTaskStore()
  const { initialize: initializeBoards } = useBoardStore()

  useEffect(() => {
    initializeTasks()
    initializeBoards()
  }, [initializeTasks, initializeBoards])

  useKeyboardShortcuts({
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onToggleView: () => setViewMode(prev => prev === 'kanban' ? 'list' : 'kanban'),
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          {activeSection === 'focus' ? (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">今日のフォーカス</h1>
              <p className="text-muted-foreground">期限が今日のタスクと重要なタスクが表示されます。</p>
            </div>
          ) : activeSection === 'tags' ? (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">タグ管理</h1>
              <p className="text-muted-foreground">タスクを整理するためのタグを管理できます。</p>
            </div>
          ) : activeSection === 'todos' ? (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">Code TODO</h1>
              <p className="text-muted-foreground">コードベースから抽出されたTODOコメントを管理できます。</p>
            </div>
          ) : activeSection === 'settings' ? (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">設定</h1>
              <p className="text-muted-foreground">アプリケーションの設定を調整できます。</p>
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard />
          ) : (
            <TodoList />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  )
}