'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useTaskStore } from '@/stores/taskStore'
import {
  Search,
  Plus,
  CheckSquare,
  LayoutGrid,
  List,
  Settings,
  Calendar,
  Tag,
  GitBranch,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const { tasks, addTask, searchTasks } = useTaskStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNewTask = async () => {
    const title = prompt('新しいタスクのタイトルを入力してください:')
    if (title) {
      await addTask({ title })
      onClose()
    }
  }

  const searchResults = search ? searchTasks(search) : []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <Command className="relative w-full max-w-2xl overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg animate-fade-in">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="コマンドまたはタスクを検索..."
            className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          {!search && (
            <>
              <Command.Group heading="アクション">
                <Command.Item
                  onSelect={handleNewTask}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  新しいタスクを作成
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <CheckSquare className="h-4 w-4" />
                  クイックタスク追加
                </Command.Item>
              </Command.Group>

              <Command.Group heading="ビュー">
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <LayoutGrid className="h-4 w-4" />
                  カンバンボード
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <List className="h-4 w-4" />
                  TODOリスト
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  今日のフォーカス
                </Command.Item>
              </Command.Group>

              <Command.Group heading="管理">
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Tag className="h-4 w-4" />
                  タグ管理
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <GitBranch className="h-4 w-4" />
                  Code TODO連携
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  設定
                </Command.Item>
              </Command.Group>
            </>
          )}

          {search && searchResults.length > 0 && (
            <Command.Group heading="検索結果">
              {searchResults.map((task) => (
                <Command.Item
                  key={task.id}
                  className="flex flex-col items-start gap-1 rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-muted-foreground">
                      {task.description}
                    </div>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {search && searchResults.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              検索結果が見つかりません
            </div>
          )}
        </Command.List>

        <div className="border-t p-2">
          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ 移動</span>
              <span>Enter 選択</span>
              <span>Esc 閉じる</span>
            </div>
          </div>
        </div>
      </Command>
    </div>
  )
}