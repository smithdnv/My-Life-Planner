'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string }
interface DiscoveredGoal { title: string; why: string; domain: string; time_horizon: string }

const WELCOME = `Welcome! I'm so glad you're here. 🎉

This is your Life Goal Discovery space — a conversation where we'll uncover what truly matters to you, not just what sounds good on paper.

Before we dive in, I want to ask you something open-ended:

**If you could wave a magic wand and have your life look exactly the way you want it to in 5 years — what would be different from today?**

Take your time. There's no wrong answer.`

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [discoveredGoals, setDiscoveredGoals] = useState<DiscoveredGoal[]>([])
  const [savingGoal, setSavingGoal] = useState<DiscoveredGoal | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  // Load existing session from Supabase on mount
  useEffect(() => {
    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load existing goals
      const { data: existingGoals } = await supabase
        .from('life_goals')
        .select('title, why, time_horizon, life_domains(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (existingGoals?.length) {
        setDiscoveredGoals(existingGoals.map((g: any) => ({
          title: g.title,
          why: g.why,
          domain: g.life_domains?.name ?? '',
          time_horizon: g.time_horizon,
        })))
      }

      // Load saved conversation
      const { data: session } = await supabase
        .from('onboarding_sessions')
        .select('messages')
        .eq('user_id', user.id)
        .single()

      if (session?.messages?.length) {
        setMessages(session.messages)
      } else {
        // Fresh start
        const welcome: Message = { role: 'assistant', content: WELCOME, timestamp: new Date().toISOString() }
        setMessages([welcome])
        await persistMessages(user.id, [welcome])
      }

      setInitializing(false)
    }
    loadSession()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function persistMessages(userId: string, msgs: Message[]) {
    await supabase
      .from('onboarding_sessions')
      .upsert({ user_id: userId, messages: msgs, updated_at: new Date().toISOString() })
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Persist immediately so user message is never lost
    await persistMessages(user.id, newMessages)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: `User has saved ${discoveredGoals.length} goals so far: ${discoveredGoals.map(g => g.title).join(', ')}`,
        }),
      })
      const data = await res.json()

      const aiMsg: Message = { role: 'assistant', content: data.message, timestamp: new Date().toISOString() }
      const withAI = [...newMessages, aiMsg]
      setMessages(withAI)

      // Persist AI response immediately
      await persistMessages(user.id, withAI)

      if (data.discoveredGoal) {
        setSavingGoal(data.discoveredGoal)
      }
    } catch (err) {
      const errMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date().toISOString()
      }
      const withErr = [...newMessages, errMsg]
      setMessages(withErr)
      await persistMessages(user.id, withErr)
    } finally {
      setLoading(false)
    }
  }

  async function saveGoal(goal: DiscoveredGoal) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: domains } = await supabase
      .from('life_domains')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', `%${goal.domain.split(' ')[0]}%`)
      .limit(1)

    await supabase.from('life_goals').insert({
      user_id: user.id,
      domain_id: domains?.[0]?.id ?? null,
      title: goal.title,
      why: goal.why,
      time_horizon: goal.time_horizon,
      status: 'active',
    })

    setDiscoveredGoals(prev => [...prev, goal])
    setSavingGoal(null)

    const confirmMsg: Message = {
      role: 'assistant',
      content: `✅ I've saved that goal: **"${goal.title}"**\n\nWould you like to explore another area of your life, or shall we wrap up for now?`,
      timestamp: new Date().toISOString()
    }
    const updated = [...messages, confirmMsg]
    setMessages(updated)

    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) await persistMessages(u.id, updated)
  }

  async function finishOnboarding() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id)
    router.push('/dashboard')
  }

  function formatMessage(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-sm">Loading your session…</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-900">✨ Life Goal Discovery</h1>
        <p className="text-sm text-slate-500 mt-1">
          An AI-guided conversation to uncover your true goals.
          <span className="ml-2 text-green-600 font-medium">● Your conversation auto-saves</span>
        </p>
        {discoveredGoals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {discoveredGoals.map((g, i) => (
              <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                ✅ {g.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              <div className={`text-xs mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {savingGoal && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">🎯 Goal discovered!</p>
            <p className="text-sm text-green-700 font-medium">"{savingGoal.title}"</p>
            <p className="text-xs text-green-600 mt-1">Why it matters: {savingGoal.why}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => saveGoal(savingGoal)} className="btn-primary text-sm py-1.5">
                ✅ Save this goal
              </button>
              <button onClick={() => setSavingGoal(null)} className="btn-secondary text-sm py-1.5">
                Refine it
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {discoveredGoals.length > 0 && (
          <div className="mb-3 flex justify-center">
            <button onClick={finishOnboarding} className="btn-secondary text-sm">
              I'm done for now → Go to dashboard
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Share your thoughts…"
            className="input flex-1"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-5">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
