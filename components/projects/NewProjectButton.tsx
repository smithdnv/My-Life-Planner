'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewProjectButton() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [group, setGroup] = useState('A')
  const [number, setNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('projects').insert({
      user_id: user.id,
      title,
      description: description || null,
      priority_group: group,
      priority_number: number,
      status: 'active',
      time_horizon: 'monthly',
    })

    setTitle(''); setDescription(''); setGroup('A'); setNumber(1)
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        + New project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">New project</h2>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Project name *</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Get healthy by summer" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this project about?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priority group</label>
                  <select className="input" value={group} onChange={e => setGroup(e.target.value)}>
                    {['A','B','C','D','E'].map(g => <option key={g} value={g}>Group {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority #</label>
                  <input type="number" min={1} className="input" value={number} onChange={e => setNumber(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
