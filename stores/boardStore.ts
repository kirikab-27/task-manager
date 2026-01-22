import { create } from 'zustand'
import { Board, BoardColumn } from '@/types/task'

interface BoardStore {
  boards: Board[]
  activeBoard: Board | null
  columns: BoardColumn[]

  initialize: () => void
  setActiveBoard: (board: Board) => void
  addColumn: (column: Omit<BoardColumn, 'id' | 'createdAt'>) => void
  updateColumn: (id: string, updates: Partial<BoardColumn>) => void
  deleteColumn: (id: string) => void
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  activeBoard: null,
  columns: [],

  initialize: () => {
    // 初期データ（開発用）
    const mockBoard: Board = {
      id: 'board-1',
      name: 'メインボード',
      description: 'デフォルトのカンバンボード',
      boardType: 'kanban',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockColumns: BoardColumn[] = [
      {
        id: 'column-1',
        boardId: 'board-1',
        name: 'TODO',
        position: 0,
        color: '#e2e8f0',
        createdAt: new Date(),
      },
      {
        id: 'column-2',
        boardId: 'board-1',
        name: '進行中',
        position: 1,
        color: '#fbbf24',
        createdAt: new Date(),
      },
      {
        id: 'column-3',
        boardId: 'board-1',
        name: '完了',
        position: 2,
        color: '#34d399',
        createdAt: new Date(),
      },
    ]

    set({
      boards: [mockBoard],
      activeBoard: mockBoard,
      columns: mockColumns,
    })
  },

  setActiveBoard: (board) => {
    set({ activeBoard: board })
  },

  addColumn: (column) => {
    const newColumn: BoardColumn = {
      ...column,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    set((state) => ({
      columns: [...state.columns, newColumn]
    }))
  },

  updateColumn: (id, updates) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      )
    }))
  },

  deleteColumn: (id) => {
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id)
    }))
  },
}))