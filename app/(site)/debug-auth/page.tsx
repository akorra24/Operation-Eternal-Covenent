'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      setAuthState({
        user: user ? {
          id: user.id,
          email: user.email,
          email_confirmed: !!user.email_confirmed_at,
          created_at: user.created_at,
        } : null,
        session: session ? {
          access_token: session.access_token ? 'Present' : 'Missing',
          expires_at: new Date(session.expires_at! * 1000).toLocaleString(),
        } : null,
        error: error?.message,
        cookies: document.cookie,
      })
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      checkAuth()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Auth Debug Info</h1>
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Current Auth State</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>What should happen after sign-in:</strong>
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-blue-700">
            <li>You should be redirected to /meals</li>
            <li>You should see a list of meals (or empty state if no meals exist)</li>
            <li>Your email should appear in the top navigation bar</li>
            <li>You should see "staff" or "admin" next to your email</li>
            <li>If you're admin, you'll see "New Meal" and "Settings" links</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
