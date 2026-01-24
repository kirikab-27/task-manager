'use client'

import { LayoutGrid, List, Calendar, Tag, Settings, GitBranch, X } from 'lucide-react'
import { useEffect } from 'react'

interface SidebarProps {
  viewMode: 'kanban' | 'list'
  setViewMode: (mode: 'kanban' | 'list') => void
  activeSection?: 'focus' | 'tags' | 'todos' | 'settings'
  setActiveSection?: (section: 'focus' | 'tags' | 'todos' | 'settings' | undefined) => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ viewMode, setViewMode, activeSection, setActiveSection, isOpen = false, onClose }: SidebarProps) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && onClose) {
        onClose()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [onClose])
  const menuItems = [
    {
      icon: LayoutGrid,
      label: 'カンバン',
      value: 'kanban' as const,
      active: viewMode === 'kanban',
    },
    {
      icon: List,
      label: 'リスト',
      value: 'list' as const,
      active: viewMode === 'list',
    },
  ]

  const otherItems = [
    { icon: Calendar, label: '今日のフォーカス', badge: '3', value: 'focus' as const },
    { icon: Tag, label: 'タグ管理', value: 'tags' as const },
    { icon: GitBranch, label: 'Code TODO', value: 'todos' as const },
    { icon: Settings, label: '設定', value: 'settings' as const },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed md:relative
          w-64
          h-full
          border-r border-border
          bg-card
          z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-6">
          <h2 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
            ビュー
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setViewMode(item.value)
                  if (setActiveSection) {
                    setActiveSection(undefined)
                  }
                  if (onClose && window.innerWidth < 768) {
                    onClose()
                  }
                }}
                className={`flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  item.active && !activeSection
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
            その他
          </h2>
          <nav className="space-y-1">
            {otherItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (setActiveSection) {
                    setActiveSection(item.value)
                  }
                  if (onClose && window.innerWidth < 768) {
                    onClose()
                  }
                }}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  activeSection === item.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    activeSection === item.value
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
    </>
  )
}