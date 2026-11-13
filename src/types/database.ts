export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

type Timestamp = string

export interface ProfileRow {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ProjectMemberRow {
  project_id: string
  user_id: string
  role: ProjectRole
  created_at: Timestamp
  updated_at: Timestamp
}

export interface TaskRow {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  creator_id: string
  assignee_id: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface CommentRow {
  id: string
  task_id: string
  project_id: string
  author_id: string
  body: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Pick<ProfileRow, 'id' | 'display_name'> &
          Partial<Pick<ProfileRow, 'avatar_url' | 'created_at' | 'updated_at'>>
        Update: Partial<Pick<ProfileRow, 'display_name' | 'avatar_url' | 'updated_at'>>
      }
      projects: {
        Row: ProjectRow
        Insert: Pick<ProjectRow, 'name' | 'owner_id'> &
          Partial<Pick<ProjectRow, 'description' | 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Pick<ProjectRow, 'name' | 'description' | 'owner_id' | 'updated_at'>>
      }
      project_members: {
        Row: ProjectMemberRow
        Insert: Pick<ProjectMemberRow, 'project_id' | 'user_id'> &
          Partial<Pick<ProjectMemberRow, 'role' | 'created_at' | 'updated_at'>>
        Update: Partial<Pick<ProjectMemberRow, 'role' | 'updated_at'>>
      }
      tasks: {
        Row: TaskRow
        Insert: Pick<TaskRow, 'project_id' | 'title' | 'creator_id'> &
          Partial<Pick<TaskRow, 'id' | 'description' | 'status' | 'priority' | 'assignee_id' | 'created_at' | 'updated_at'>>
        Update: Partial<Pick<TaskRow, 'project_id' | 'title' | 'description' | 'status' | 'priority' | 'creator_id' | 'assignee_id' | 'updated_at'>>
      }
      comments: {
        Row: CommentRow
        Insert: Pick<CommentRow, 'task_id' | 'project_id' | 'author_id' | 'body'> &
          Partial<Pick<CommentRow, 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Pick<CommentRow, 'task_id' | 'project_id' | 'body' | 'updated_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      project_role: ProjectRole
      task_status: TaskStatus
      task_priority: TaskPriority
    }
    CompositeTypes: Record<string, never>
  }
}

export type TableName = keyof Database['public']['Tables']
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row']
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update']
