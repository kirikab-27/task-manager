import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

interface KeyboardShortcutsProps {
  onCommandPalette?: () => void
  onToggleView?: () => void
  onNewTask?: () => void
  onSearch?: () => void
}

export function useKeyboardShortcuts({
  onCommandPalette,
  onToggleView,
  onNewTask,
  onSearch,
}: KeyboardShortcutsProps) {
  // Cmd+K or Ctrl+K でコマンドパレットを開く
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault()
    onCommandPalette?.()
  })

  // Tab でビューを切り替え
  useHotkeys('tab', (e) => {
    if (!e.target || (e.target as HTMLElement).tagName === 'BODY') {
      e.preventDefault()
      onToggleView?.()
    }
  }, { enableOnFormTags: false })

  // N で新規タスク作成
  useHotkeys('n', (e) => {
    if (!e.target || (e.target as HTMLElement).tagName === 'BODY') {
      e.preventDefault()
      onNewTask?.()
    }
  }, { enableOnFormTags: false })

  // / で検索
  useHotkeys('/', (e) => {
    e.preventDefault()
    onSearch?.()
  })

  return null
}