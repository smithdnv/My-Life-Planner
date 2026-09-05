import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Email Confirmed — My Life Planner' }

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
        <div className="text-6xl mb-5">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Email confirmed!</h1>
        <p className="text-slate-500 mb-8">
          Your email address has been verified. You're all set — go ahead and log in to start planning your life.
        </p>
        <Link href="/login" className="btn-primary px-8 py-3 inline-block text-base">
          Go to Login
        </Link>
        <p className="text-slate-400 text-sm mt-6">
          Have questions? Email us at{' '}
          <a href="mailto:planmylifegoals@outlook.com" className="text-primary-600 hover:underline">
            planmylifegoals@outlook.com
          </a>
        </p>
      </div>
    </div>
  )
}
