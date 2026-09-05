import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — My Life Planner' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 md:p-12">
        <div className="mb-8">
          <Link href="/signup" className="text-primary-600 text-sm hover:underline">← Back to sign up</Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: August 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Who We Are</h2>
            <p>My Life Planner is a personal and family life-planning application. References to "we," "us," or "our" in this policy refer to the App and its operator. Questions can be directed to <a href="mailto:planmylifegoals@outlook.com" className="text-primary-600 hover:underline">planmylifegoals@outlook.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. What Information We Collect</h2>
            <p><strong>Information you provide:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account details: name, email address, and password (passwords are never stored in plain text).</li>
              <li>App content: life goals, projects, tasks, priorities, and notes you create.</li>
              <li>AI chat conversations within the goal discovery feature.</li>
              <li>Family workspace information if you invite other members.</li>
            </ul>
            <p className="mt-3"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Basic usage data (pages visited, features used) to help improve the App.</li>
              <li>Device and browser type for compatibility purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, operate, and improve the App.</li>
              <li>To authenticate your account and keep it secure.</li>
              <li>To send account-related emails (confirmation, password reset, important notices).</li>
              <li>To power the AI coaching features (your data is sent to Anthropic's API to generate responses; see Section 6).</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell your personal information to third parties. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your data is stored in Supabase (cloud PostgreSQL), hosted on AWS infrastructure.</li>
              <li>All data is transmitted over encrypted HTTPS connections.</li>
              <li>Database connections enforce SSL encryption.</li>
              <li>Row-level security ensures each user can only access their own data.</li>
              <li>Passwords are hashed using bcrypt and never stored in plain text.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Data Retention</h2>
            <p>Your data is retained as long as your account is active. If you delete your account, your data will be permanently deleted from our systems within 30 days. Backup copies may persist for up to 90 days in archived backups before being permanently removed.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">6. Third-Party Services</h2>
            <p>The App uses the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> — database and authentication hosting. <a href="https://supabase.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
              <li><strong>Anthropic (Claude API)</strong> — AI coaching features. Content you share in the AI chat is processed by Anthropic's API. <a href="https://www.anthropic.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
              <li><strong>Vercel</strong> — app hosting. <a href="https://vercel.com/legal/privacy-policy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
              <li><strong>Google</strong> — optional "Sign in with Google" authentication. <a href="https://policies.google.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">7. Family Workspaces</h2>
            <p>If you invite family members to your workspace, they will be able to see and interact with shared projects and tasks according to the role you assign them. Each family member manages their own account and personal goals separately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access and export your data (use the backup feature in the App).</li>
              <li>Correct inaccurate information in your account.</li>
              <li>Delete your account and all associated data.</li>
              <li>Withdraw consent for optional data uses.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:planmylifegoals@outlook.com" className="text-primary-600 hover:underline">planmylifegoals@outlook.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">9. Children's Privacy</h2>
            <p>The App is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Significant changes will be communicated via email or an in-app notice. Your continued use of the App after changes constitutes acceptance of the updated policy.</p>
          </section>

        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <Link href="/signup" className="btn-primary px-6 py-2 inline-block">← Back to sign up</Link>
        </div>
      </div>
    </div>
  )
}
