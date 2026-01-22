'use client'

import { LayoutGrid, List, Calendar, Tag, Settings, GitBranch } from 'lucide-react'

interface SidebarProps {
  viewMode: 'kanban' | 'list'
  setViewMode: (mode: 'kanban' | 'list') => void
  activeSection?: 'focus' | 'tags' | 'todos' | 'settings'
  setActiveSection?: (section: 'focus' | 'tags' | 'todos' | 'settings' | undefined) => void
}

export function Sidebar({ viewMode, setViewMode, activeSection, setActiveSection }: SidebarProps) {
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
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-4">
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
  )
}