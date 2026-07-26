'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function ShowCompletedToggle({ showCompleted }: { showCompleted: boolean }) {
  const router = useRouter()
  const params = useSearchParams()

  function toggle() {
    const next = new URLSearchParams(params.toString())
    if (showCompleted) next.delete('show_completed')
    else next.set('show_completed', 'true')
    router.push(`?${next.toString()}`)
  }

  return (
    <button onClick={toggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
        showCompleted
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}>
      <span>{showCompleted ? '✅' : '⬜'}</span>
      {showCompleted ? 'Hiding completed' : 'Show completed'}
    </button>
  )
}
