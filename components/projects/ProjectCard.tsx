import Link from 'next/link'

export default function ProjectCard({ project }: { project: any }) {
  const totalTasks = project.tasks?.length ?? 0
  const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length ?? 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <Link href={`/projects/${project.id}`}
      className="card p-5 hover:border-primary-200 hover:shadow-md transition-all block group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`priority-badge priority-${project.priority_group}`}>
            {project.priority_group}{project.priority_number}
          </span>
          {project.life_goals && (
            <span className="text-sm text-slate-400">
              {project.life_goals.life_domains?.icon} {project.life_goals.title}
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          project.status === 'active' ? 'bg-green-50 text-green-700' :
          project.status === 'on_hold' ? 'bg-amber-50 text-amber-700' :
          'bg-slate-100 text-slate-500'
        }`}>{project.status}</span>
      </div>

      <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors mb-2">
        {project.title}
      </h3>

      {project.description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      {totalTasks > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{completedTasks}/{totalTasks} tasks</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {project.due_date && (
        <p className="text-xs text-slate-400 mt-3">
          📅 Due {new Date(project.due_date).toLocaleDateString()}
        </p>
      )}
    </Link>
  )
}
