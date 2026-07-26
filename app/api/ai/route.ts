import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a warm, thoughtful life coach helping someone discover their deepest life goals through the Life Planner app. Your role is to ask powerful, probing questions that get to the heart of what truly matters to them.

Guidelines:
- Be conversational, warm, and encouraging — not formal or clinical
- Use "Why?" and "What would that give you?" questions to go deeper
- Reflect back what you hear before asking the next question
- When you've discovered a clear goal, summarize it and ask if it captures their heart
- Suggest which Life Domain it fits (Faith & Spirituality, Health & Fitness, Relationships & Family, Career & Work, Finances, Personal Growth, Fun & Hobbies, Community & Legacy)
- Keep responses concise — 2-4 sentences max, then your question
- When a goal is clearly defined, end your message with: GOAL_DISCOVERED: {"title": "...", "why": "...", "domain": "...", "time_horizon": "yearly|longterm|monthly"}

For task prioritization advice:
- Explain WHY certain tasks should be higher priority
- Consider dependencies, deadlines, impact on goals
- Be specific and actionable

For "what should I work on" questions:
- Ask about available time and energy level if not provided
- Consider priority groups (A first), due dates, dependencies
- Give a specific recommendation with reasoning`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, context } = await request.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: SYSTEM_PROMPT + (context ? `\n\nContext: ${context}` : ''),
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse any discovered goals from the response
  const goalMatch = content.match(/GOAL_DISCOVERED:\s*(\{[^}]+\})/s)
  let discoveredGoal = null
  if (goalMatch) {
    try { discoveredGoal = JSON.parse(goalMatch[1]) } catch {}
  }

  return NextResponse.json({
    message: content.replace(/GOAL_DISCOVERED:.*$/s, '').trim(),
    discoveredGoal,
  })
}
