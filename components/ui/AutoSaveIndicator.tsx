'use client'

interface Props {
  saving: boolean
  lastSaved: Date | null
  error: string | null
  pendingChanges: boolean
  className?: string
}

export function AutoSaveIndicator({ saving, lastSaved, error, pendingChanges, className = '' }: Props) {
  if (error) {
    return (
      <span className={`text-xs text-red-500 flex items-center gap-1 ${className}`}>
        <span>⚠️</span> Save failed — changes logged locally
      </span>
    )
  }
  if (saving || pendingChanges) {
    return (
      <span className={`text-xs text-slate-400 flex items-center gap-1 ${className}`}>
        <span className="animate-spin inline-block">↻</span> Saving…
      </span>
    )
  }
  if (lastSaved) {
    return (
      <span className={`text-xs text-green-600 flex items-center gap-1 ${className}`}>
        <span>✓</span> Saved {formatTime(lastSaved)}
      </span>
    )
  }
  return null
}

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 5000) return 'just now'
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
