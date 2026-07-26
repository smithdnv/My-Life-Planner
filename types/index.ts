// ─── Core Enums ────────────────────────────────────────────────────────────

export type TimeHorizon = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'longterm'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'abandoned'
export type WorkspaceRole = 'owner' | 'co_owner' | 'full_control' | 'basic_editor' | 'viewer'

// ─── User / Profile ─────────────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  routine_description?: string       // e.g. "prayer and going to work"
  notification_time: string          // "08:00"
  notifications_enabled: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// ─── Life Domains ────────────────────────────────────────────────────────────

export interface LifeDomain {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  sort_order: number
  is_visible: boolean
  created_at: string
}

export const DEFAULT_DOMAINS: Omit<LifeDomain, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Faith & Spirituality', icon: '✝️', color: '#7e22ce', sort_order: 1, is_visible: true },
  { name: 'Health & Fitness',     icon: '💪', color: '#16a34a', sort_order: 2, is_visible: true },
  { name: 'Relationships & Family',icon: '❤️', color: '#dc2626', sort_order: 3, is_visible: true },
  { name: 'Career & Work',        icon: '💼', color: '#0369a1', sort_order: 4, is_visible: true },
  { name: 'Finances',             icon: '💰', color: '#ca8a04', sort_order: 5, is_visible: true },
  { name: 'Personal Growth',      icon: '🌱', color: '#059669', sort_order: 6, is_visible: true },
  { name: 'Fun & Hobbies',        icon: '🎯', color: '#ea580c', sort_order: 7, is_visible: true },
  { name: 'Community & Legacy',   icon: '🌍', color: '#0891b2', sort_order: 8, is_visible: true },
]

// ─── Life Goals ──────────────────────────────────────────────────────────────

export interface LifeGoal {
  id: string
  user_id: string
  domain_id: string
  domain?: LifeDomain
  title: string
  why: string                        // "Why does this matter to you?"
  vision_statement?: string
  time_horizon: TimeHorizon
  status: GoalStatus
  sort_order: number
  projects?: Project[]
  created_at: string
  updated_at: string
}

// ─── Priority Groups ─────────────────────────────────────────────────────────

export interface PriorityGroup {
  id: string
  user_id: string
  letter: string                     // 'A', 'B', 'C', ...
  name: string                       // 'Required', 'Should-Do', 'Nice-To-Have', ...
  sort_order: number
  created_at: string
}

export const DEFAULT_PRIORITY_GROUPS: Omit<PriorityGroup, 'id' | 'user_id' | 'created_at'>[] = [
  { letter: 'A', name: 'Required',      sort_order: 1 },
  { letter: 'B', name: 'Should-Do',     sort_order: 2 },
  { letter: 'C', name: 'Nice-To-Have',  sort_order: 3 },
]

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  user_id: string
  goal_id?: string
  goal?: LifeGoal
  parent_project_id?: string
  parent_project?: Project
  title: string
  description?: string
  priority_group: string             // 'A', 'B', 'C', ...
  priority_number: number
  status: ProjectStatus
  time_horizon: TimeHorizon
  due_date?: string
  sort_order: number
  tasks?: Task[]
  sub_projects?: Project[]
  created_at: string
  updated_at: string
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  project_id: string
  project?: Project
  assigned_to?: string
  assigned_user?: Profile
  title: string
  description?: string
  priority_group: string             // 'A', 'B', 'C', ...
  priority_number: number
  status: TaskStatus
  time_horizon: TimeHorizon
  due_date?: string
  is_recurring: boolean
  recurrence_rule?: string           // iCal RRULE format
  blocked_by?: string[]              // task IDs this depends on
  completed_at?: string
  sort_order: number
  created_at: string
  updated_at: string
}

// Computed badge label: "A1", "B3", etc.
export function priorityBadge(group: string, number: number) {
  return `${group}${number}`
}

// ─── Task History (Undo) ─────────────────────────────────────────────────────

export type HistoryAction =
  | 'created' | 'updated' | 'deleted' | 'moved' | 'copied'
  | 'priority_changed' | 'status_changed' | 'assigned'

export interface TaskHistory {
  id: string
  task_id?: string
  project_id?: string
  user_id: string
  action: HistoryAction
  before_state?: Record<string, unknown>
  after_state?: Record<string, unknown>
  description: string                // human-readable summary
  depends_on?: string[]              // history IDs that must also be reverted
  created_at: string
}

// ─── Family Workspace ────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  owner_id: string
  name: string
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  profile?: Profile
  role: WorkspaceRole
  invited_by: string
  joined_at?: string
  created_at: string
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OnboardingState {
  stage: 'welcome' | 'domain_selection' | 'goal_discovery' | 'vision' | 'complete'
  current_domain?: string
  messages: AIMessage[]
  discovered_goals: Partial<LifeGoal>[]
}

// ─── View Config ─────────────────────────────────────────────────────────────

export interface ProjectViewConfig {
  project_id: string
  show_groups: string[]              // which priority groups to show
  max_tasks: number                  // how many tasks to show
  show_completed: boolean
}

export interface SavedView {
  id: string
  user_id: string
  name: string
  project_configs: ProjectViewConfig[]
  sort_by: 'priority' | 'due_date' | 'created_at'
  created_at: string
}
