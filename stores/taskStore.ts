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
    // TODOリストから追加された場合は自動的にTODOカラムに配置
    let boardColumnId = input.boardColumnId
    let status = input.status || 'todo'

    if (!boardColumnId && status === 'todo') {
      boardColumnId = 'column-1' // TODOカラム
    } else if (!boardColumnId && status === 'in_progress') {
      boardColumnId = 'column-2' // 進行中カラム
    } else if (!boardColumnId && status === 'done') {
      boardColumnId = 'column-3' // 完了カラム
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      status,
      priority: input.priority || 3,
      dueDate: input.dueDate,
      boardColumnId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set((state) => ({
      tasks: [...state.tasks, newTask]
    }))
  },

  updateTask: async (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task

        let updates = { ...input }

        // ステータスが変更された場合、対応するカラムも更新
        if (input.status && !input.boardColumnId) {
          if (input.status === 'todo') {
            updates.boardColumnId = 'column-1'
            updates.completedAt = undefined
          } else if (input.status === 'in_progress') {
            updates.boardColumnId = 'column-2'
            updates.completedAt = undefined
          } else if (input.status === 'done') {
            updates.boardColumnId = 'column-3'
            updates.completedAt = new Date()
          }
        }

        return { ...task, ...updates, updatedAt: new Date() }
      })
    }))
  },

  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }))
  },

  moveTask: async (taskId, columnId, position) => {
    // カラムIDに基づいてステータスも更新
    let newStatus: 'todo' | 'in_progress' | 'done' = 'todo'
    let completedAt: Date | undefined = undefined

    if (columnId === 'column-1') {
      newStatus = 'todo'
      completedAt = undefined
    } else if (columnId === 'column-2') {
      newStatus = 'in_progress'
      completedAt = undefined
    } else if (columnId === 'column-3') {
      newStatus = 'done'
      completedAt = new Date()
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              boardColumnId: columnId,
              position,
              status: newStatus,
              completedAt: completedAt || task.completedAt,
              updatedAt: new Date()
            }
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
              boardColumnId: 'column-3', // 完了カラムに移動
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