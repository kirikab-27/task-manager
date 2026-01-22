export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done' | 'archived'
  priority: number
  dueDate?: Date | null
  reminderDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  position?: number | null
  boardColumnId?: string | null
  parentTaskId?: string | null
  estimatedMinutes?: number | null
  actualMinutes?: number | null
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  color?: string | null
  icon?: string | null
  createdAt: Date
}

export interface Board {
  id: string
  name: string
  description?: string | null
  boardType: 'kanban' | 'list'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  columns?: BoardColumn[]
}

export interface BoardColumn {
  id: string
  boardId: string
  name: string
  position: number
  color?: string | null
  wipLimit?: number | null
  createdAt: Date
  tasks?: Task[]
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'done'
  priority?: number
  dueDate?: Date | null
  boardColumnId?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'done' | 'archived'
  priority?: number
  dueDate?: Date | null
  boardColumnId?: string | null
  position?: number
}