import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/projects/ProjectCard'
import NewProjectButton from '@/components/projects/NewProjectButton'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      life_goals ( title, life_domains ( icon, name ) ),
      tasks ( id, status )
    `)
    .eq('user_id', user.id)
    .is('parent_project_id', null)
    .neq('status', 'archived')
    .order('priority_group')
    .order('priority_number')

  const grouped = (projects ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    const g = p.priority_group
    if (!acc[g]) acc[g] = []
    acc[g].push(p)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📋 Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects?.length ?? 0} active projects</p>
        </div>
        <NewProjectButton />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first project to start organizing your goals into action.</p>
          <NewProjectButton />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, groupProjects]) => (
            <div key={group}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`priority-badge priority-${group} text-sm px-3 py-1`}>Group {group}</span>
                <span className="text-slate-400 text-sm">{(groupProjects as any[]).length} project{(groupProjects as any[]).length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(groupProjects as any[]).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
