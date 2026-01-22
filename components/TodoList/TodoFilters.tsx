'use client'

interface TodoFiltersProps {
  filter: 'all' | 'todo' | 'done'
  setFilter: (filter: 'all' | 'todo' | 'done') => void
}

export function TodoFilters({ filter, setFilter }: TodoFiltersProps) {
  const filters = [
    { value: 'all' as const, label: 'すべて' },
    { value: 'todo' as const, label: '未完了' },
    { value: 'done' as const, label: '完了' },
  ]

  return (
    <div className="flex rounded-lg border border-border bg-muted p-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            filter === f.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}