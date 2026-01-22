# タスク管理アプリ - システム設計書

## 1. システムアーキテクチャ

### 全体構成
```
┌─────────────────────────────────────────────────────────┐
│                    フロントエンド層                       │
│  React + TypeScript + TailwindCSS + Zustand             │
│  - カンバンボード UI                                     │
│  - TODOリスト UI                                        │
│  - コマンドパレット (Cmd+K)                             │
└───────────────────────────────────────────────────────┘
                            │
                    Tauri IPC Bridge
                            │
┌───────────────────────────────────────────────────────┐
│                     バックエンド層                       │
│               Rust (Tauri Backend)                      │
│  - ビジネスロジック                                     │
│  - データベースアクセス                                 │
│  - ファイルシステム操作                                 │
│  - Git連携 (libgit2)                                   │
└───────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────┐
│                      データ層                           │
│  SQLite (ローカルDB) + JSON/Markdown (エクスポート)    │
└───────────────────────────────────────────────────────┘
```

### アーキテクチャパターン
- **Hybrid Local-First Architecture**: ローカル優先で高速動作、将来的にクラウド同期をオプション追加
- **Event-Driven Architecture**: フロントエンド-バックエンド間はイベントベースの通信
- **CQRS Pattern**: 読み込みと書き込みを分離し、パフォーマンスを最適化

### セキュリティ設計
- Tauri の Context Isolation によるセキュアな IPC
- SQLite の暗号化オプション (SQLCipher)
- 将来的な E2EE 同期に備えた設計

## 2. データベーススキーマ

### ERD
```sql
-- タスクテーブル
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'done', 'archived')),
    priority INTEGER DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
    due_date TIMESTAMP,
    reminder_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER, -- カンバンボード内の位置
    board_column TEXT, -- カンバンボードのカラムID
    parent_task_id TEXT, -- サブタスク対応
    estimated_minutes INTEGER, -- 見積時間（分）
    actual_minutes INTEGER, -- 実際の作業時間（分）
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- タグテーブル
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- タスク-タグ中間テーブル
CREATE TABLE task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- プロジェクト/ボードテーブル
CREATE TABLE boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    board_type TEXT CHECK(board_type IN ('kanban', 'list')),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ボードカラムテーブル（カンバン用）
CREATE TABLE board_columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT,
    wip_limit INTEGER, -- WIP制限
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- Gitリポジトリ連携テーブル
CREATE TABLE git_repos (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_scan_at TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- コードTODOテーブル
CREATE TABLE code_todos (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    todo_type TEXT CHECK(todo_type IN ('TODO', 'FIXME', 'HACK', 'NOTE')),
    content TEXT NOT NULL,
    author TEXT,
    commit_hash TEXT,
    task_id TEXT, -- 関連タスクID
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (repo_id) REFERENCES git_repos(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- 設定テーブル
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- タイムトラッキングテーブル
CREATE TABLE time_entries (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_board_column ON tasks(board_column);
CREATE INDEX idx_code_todos_repo_file ON code_todos(repo_id, file_path);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
```

## 3. API設計（主要エンドポイント）

### Tauri Command API (IPC)

```typescript
// タスク関連
invoke('get_tasks', { filter?: TaskFilter }): Promise<Task[]>
invoke('create_task', { task: CreateTaskInput }): Promise<Task>
invoke('update_task', { id: string, updates: UpdateTaskInput }): Promise<Task>
invoke('delete_task', { id: string }): Promise<void>
invoke('move_task', { id: string, columnId: string, position: number }): Promise<void>
invoke('complete_task', { id: string }): Promise<Task>
invoke('archive_task', { id: string }): Promise<Task>

// タグ関連
invoke('get_tags'): Promise<Tag[]>
invoke('create_tag', { tag: CreateTagInput }): Promise<Tag>
invoke('update_tag', { id: string, updates: UpdateTagInput }): Promise<Tag>
invoke('delete_tag', { id: string }): Promise<void>
invoke('assign_tag', { taskId: string, tagId: string }): Promise<void>
invoke('remove_tag', { taskId: string, tagId: string }): Promise<void>

// ボード関連
invoke('get_boards'): Promise<Board[]>
invoke('get_board', { id: string }): Promise<BoardWithColumns>
invoke('create_board', { board: CreateBoardInput }): Promise<Board>
invoke('update_board', { id: string, updates: UpdateBoardInput }): Promise<Board>
invoke('delete_board', { id: string }): Promise<void>
invoke('create_column', { boardId: string, column: CreateColumnInput }): Promise<BoardColumn>
invoke('update_column', { id: string, updates: UpdateColumnInput }): Promise<BoardColumn>
invoke('delete_column', { id: string }): Promise<void>

// Git連携
invoke('add_git_repo', { path: string }): Promise<GitRepo>
invoke('scan_todos', { repoId: string }): Promise<CodeTodo[]>
invoke('link_todo_to_task', { todoId: string, taskId: string }): Promise<void>
invoke('jump_to_code', { todoId: string }): Promise<void>

// デイリーフォーカス
invoke('get_today_focus'): Promise<Task[]>
invoke('set_today_focus', { taskIds: string[] }): Promise<void>
invoke('get_daily_summary', { date: string }): Promise<DailySummary>

// タイムトラッキング
invoke('start_timer', { taskId: string }): Promise<TimeEntry>
invoke('stop_timer', { entryId: string }): Promise<TimeEntry>
invoke('get_time_entries', { taskId: string }): Promise<TimeEntry[]>

// 検索・フィルタ
invoke('search_tasks', { query: string }): Promise<Task[]>
invoke('get_upcoming_tasks', { days: number }): Promise<Task[]>
invoke('get_overdue_tasks'): Promise<Task[]>

// エクスポート/インポート
invoke('export_data', { format: 'json' | 'markdown' }): Promise<string>
invoke('import_data', { data: string, format: 'json' | 'markdown' }): Promise<void>
invoke('import_github_issues', { repo: string, token?: string }): Promise<Task[]>

// 設定
invoke('get_settings'): Promise<Settings>
invoke('update_settings', { settings: Partial<Settings> }): Promise<Settings>
```

## 4. ディレクトリ構造

```
task-manager/
├── src-tauri/           # Tauri バックエンド (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/   # Tauri コマンド
│   │   │   ├── mod.rs
│   │   │   ├── tasks.rs
│   │   │   ├── tags.rs
│   │   │   ├── boards.rs
│   │   │   ├── git.rs
│   │   │   └── settings.rs
│   │   ├── models/     # データモデル
│   │   │   ├── mod.rs
│   │   │   ├── task.rs
│   │   │   ├── tag.rs
│   │   │   ├── board.rs
│   │   │   └── git_todo.rs
│   │   ├── db/         # データベース
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs
│   │   │   ├── migrations.rs
│   │   │   └── queries.rs
│   │   ├── services/   # ビジネスロジック
│   │   │   ├── mod.rs
│   │   │   ├── task_service.rs
│   │   │   ├── git_scanner.rs
│   │   │   ├── time_tracker.rs
│   │   │   └── export_service.rs
│   │   └── utils/      # ユーティリティ
│   │       ├── mod.rs
│   │       └── id_generator.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # フロントエンド (React + TypeScript)
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/      # UIコンポーネント
│   │   ├── Board/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── BoardColumn.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── TodoList/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoFilters.tsx
│   │   ├── CommandPalette/
│   │   │   ├── CommandPalette.tsx
│   │   │   └── CommandItem.tsx
│   │   ├── DailyFocus/
│   │   │   ├── DailyFocus.tsx
│   │   │   └── FocusTask.tsx
│   │   ├── CodeTodos/
│   │   │   ├── CodeTodosList.tsx
│   │   │   └── CodeTodoItem.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Icons.tsx
│   │   └── Layout/
│   │       ├── AppLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── hooks/           # カスタムフック
│   │   ├── useTasks.ts
│   │   ├── useBoards.ts
│   │   ├── useKeyboard.ts
│   │   └── useTimer.ts
│   ├── stores/          # 状態管理 (Zustand)
│   │   ├── taskStore.ts
│   │   ├── boardStore.ts
│   │   ├── uiStore.ts
│   │   └── settingsStore.ts
│   ├── services/        # API通信
│   │   ├── api.ts
│   │   ├── taskApi.ts
│   │   ├── boardApi.ts
│   │   └── gitApi.ts
│   ├── types/           # TypeScript型定義
│   │   ├── task.ts
│   │   ├── board.ts
│   │   ├── git.ts
│   │   └── common.ts
│   ├── utils/           # ユーティリティ
│   │   ├── date.ts
│   │   ├── keyboard.ts
│   │   └── dnd.ts
│   └── styles/          # スタイル
│       ├── globals.css
│       └── tailwind.css
├── public/              # 静的ファイル
│   └── icons/
├── tests/               # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                # ドキュメント
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
├── scripts/             # ビルド・デプロイスクリプト
│   ├── build.sh
│   └── release.sh
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
├── LICENSE
└── .github/
    └── workflows/
        └── release.yml
```

## 5. 技術スタック

### フロントエンド
- **フレームワーク**: React 18 + TypeScript 5
- **ビルドツール**: Vite 5
- **スタイリング**: TailwindCSS 3 + shadcn/ui
- **状態管理**: Zustand 4
- **ドラッグ&ドロップ**: @dnd-kit/sortable
- **アイコン**: Lucide React
- **日付処理**: date-fns
- **キーボード操作**: react-hotkeys-hook
- **コマンドパレット**: cmdk

### バックエンド
- **フレームワーク**: Tauri 2.0 (Rust)
- **データベース**: SQLite 3 + sqlx
- **Git操作**: git2-rs (libgit2 wrapper)
- **ID生成**: nanoid
- **日時処理**: chrono
- **シリアライズ**: serde + serde_json
- **エラー処理**: thiserror + anyhow

### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター/フォーマッター**:
  - TypeScript: ESLint + Prettier
  - Rust: rustfmt + clippy
- **テスト**:
  - Frontend: Vitest + React Testing Library
  - Backend: Rust built-in test
  - E2E: Playwright
- **CI/CD**: GitHub Actions
- **バージョン管理**: Git + GitHub

### 将来的な拡張用
- **同期サーバー**: Supabase / PocketBase (E2EE対応)
- **モバイルアプリ**: Tauri Mobile (iOS/Android)
- **プラグインシステム**: WASM プラグイン

## 6. 主要な設計上の決定事項

### Local-First Architecture
- データは完全にローカルに保存（SQLite）
- オフラインファーストで動作
- 同期は後から追加可能なオプション機能として設計

### Keyboard-First UX
- すべての主要操作にキーボードショートカットを割り当て
- Cmd+K でコマンドパレット起動
- j/k でナビゲーション、Enter で編集
- Vimモードは将来的なオプション機能

### Code TODO Integration
- libgit2 を使用してGitリポジトリを直接スキャン
- TODO/FIXME コメントを自動検出
- VS Code等のエディタと連携（ディープリンク）

### パフォーマンス最適化
- 仮想スクロール（大量タスク対応）
- SQLiteのインデックス最適化
- React.memo と useMemo による再レンダリング最適化
- Rust側での並列処理（rayon使用）

### セキュリティ
- Tauri の Context Isolation
- CSP (Content Security Policy) の適切な設定
- 将来的な E2EE 同期に向けた暗号化対応

### 拡張性
- プラグインアーキテクチャの準備
- データエクスポート/インポート機能
- APIファーストな設計

## 7. MVP機能スコープ (P0)

1. **基本的なタスク管理**
   - タスクの作成/編集/削除
   - ステータス変更（TODO/進行中/完了）
   - 優先度設定

2. **カンバンボード**
   - ドラッグ&ドロップによるカード移動
   - カラムのカスタマイズ
   - WIP制限（オプション）

3. **TODOリスト表示**
   - リスト形式での表示
   - チェックボックスでの完了管理
   - インラインエディット

4. **Code TODO Integration**
   - Gitリポジトリのスキャン
   - TODO/FIXMEコメントの自動検出
   - エディタへのジャンプ機能

5. **基本的な検索とフィルタ**
   - キーワード検索
   - ステータスフィルタ
   - タグフィルタ

6. **キーボード操作**
   - 基本的なショートカット
   - コマンドパレット（Cmd+K）

7. **データ永続化**
   - ローカルSQLite保存
   - JSONエクスポート機能

## 8. 今後の拡張計画

### Phase 1 (v1.0)
- Daily Focus View
- 期限管理とリマインダー
- タイムトラッキング基本機能
- GitHub Issues インポート

### Phase 2 (Growth)
- E2EE クラウド同期（有料）
- ポモドーロタイマー
- 詳細な分析レポート
- チーム共有機能（読み取り専用）

### Phase 3 (Maturity)
- モバイルアプリ（iOS/Android）
- プラグインシステム
- AI アシスタント統合
- カスタムワークフロー自動化