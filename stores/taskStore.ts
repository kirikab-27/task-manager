import { create } from 'zustand'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

interface TaskStore {
  tasks: Task[]
  isLoading: boolean
  error: string | null

  initialize: () => void
  addTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, columnId: string, position: number) => Promise<void>
  completeTask: (id: string) => Promise<void>
  searchTasks: (query: string) => Task[]
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  initialize: () => {
    // 初期データをセット（開発用）
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'プロジェクトの設計書を作成',
        description: 'タスク管理アプリの設計書を完成させる',
        status: 'in_progress',
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        boardColumnId: 'column-2',
      },
      {
        id: '2',
        title: 'UIコンポーネントの実装',
        description: 'カンバンボードとTODOリストのコンポーネントを作成',
        status: 'todo',
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        boardColumnId: 'column-1',
      },
      {
        id: '3',
        title: 'データベース接続の設定',
        description: 'PrismaでSQLiteを設定',
        status: 'done',
        priority: 3,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        boardColumnId: 'column-3',
      },
    ]
    set({ tasks: mockTasks })
  },

  addTask: async (input) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      status: input.status || 'todo',
      priority: input.priority || 3,
      dueDate: input.dueDate,
      boardColumnId: input.boardColumnId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set((state) => ({
      tasks: [...state.tasks, newTask]
    }))
  },

  updateTask: async (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...input, updatedAt: new Date() }
          : task
      )
    }))
  },

  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }))
  },

  moveTask: async (taskId, columnId, position) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, boardColumnId: columnId, position, updatedAt: new Date() }
          : task
      )
    }))
  },

  completeTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'done' as const,
              completedAt: new Date(),
              updatedAt: new Date()
            }
          : task
      )
    }))
  },

  searchTasks: (query) => {
    const tasks = get().tasks
    const lowerQuery = query.toLowerCase()

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery))
    )
  },
}))