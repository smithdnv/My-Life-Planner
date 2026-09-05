import Link from 'next/link'

export const metadata = { title: 'Terms of Service — My Life Planner' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 md:p-12">
        <div className="mb-8">
          <Link href="/signup" className="text-primary-600 text-sm hover:underline">← Back to sign up</Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: August 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account and using My Life Planner ("the App"), you agree to these Terms of Service. If you do not agree, please do not use the App.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Description of Service</h2>
            <p>My Life Planner is a personal and family life-planning application that helps you discover goals, organize projects, and manage priorities. The App includes AI-assisted coaching features powered by Anthropic's Claude API.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Accounts and Access</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate information when creating your account.</li>
              <li>You are responsible for maintaining the security of your password.</li>
              <li>You may invite family members to share your workspace under the roles described in the App.</li>
              <li>One account per person. Sharing your login credentials with others outside your household is not permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Acceptable Use</h2>
            <p>You agree not to use the App to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable laws or regulations.</li>
              <li>Harass, threaten, or harm others.</li>
              <li>Attempt to gain unauthorized access to the App, its servers, or other users' data.</li>
              <li>Use automated tools to scrape or abuse the service.</li>
            </ul>
            <p className="mt-2">Access may be suspended or permanently revoked for violations of these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Subscription and Payment</h2>
            <p>The App currently operates in a free development phase. When a paid subscription is introduced, you will be notified in advance with clear pricing and terms. Paid plans will be billed on an annual basis unless otherwise stated.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">6. Your Data</h2>
            <p>Your goals, projects, tasks, and personal information belong to you. We do not sell your data. See our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link> for full details on how your data is stored and used.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">7. AI Features</h2>
            <p>The AI coaching features in the App are powered by Anthropic's Claude. Conversations with the AI may be used to improve responses within your session. We do not use your personal goal data to train AI models. Please do not share highly sensitive personal or financial information in the AI chat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">8. Disclaimer of Warranties</h2>
            <p>The App is provided "as is" without warranties of any kind. We make no guarantees that the service will be uninterrupted, error-free, or that data will never be lost. We recommend using the built-in backup features regularly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, My Life Planner and its creators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Significant changes will be communicated via email or an in-app notification. Continued use of the App after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">11. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:planmylifegoals@outlook.com" className="text-primary-600 hover:underline">planmylifegoals@outlook.com</a>.</p>
          </section>

        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <Link href="/signup" className="btn-primary px-6 py-2 inline-block">← Back to sign up</Link>
        </div>
      </div>
    </div>
  )
}
