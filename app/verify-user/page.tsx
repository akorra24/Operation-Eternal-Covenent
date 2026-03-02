'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyUserPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function checkUser() {
    setLoading(true)
    setUserInfo(null)

    try {
      // Try to sign in to get user info
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setUserInfo({ error: error.message })
        setLoading(false)
        return
      }

      if (data?.user) {
        // Get full user info
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          setUserInfo({ error: userError.message })
        } else if (user) {
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          setUserInfo({
            user: {
              id: user.id,
              email: user.email,
              email_confirmed: !!user.email_confirmed_at,
              created_at: user.created_at,
              last_sign_in: user.last_sign_in_at,
              app_metadata: user.app_metadata,
              user_metadata: user.user_metadata,
              // Note: provider info is in app_metadata or user_metadata
            },
            profile: profile || 'No profile found',
            session: data.session ? 'Active' : 'No session',
          })
        }
      }
    } catch (err: any) {
      setUserInfo({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Verify User Account</h1>
      
      <div className="mb-6 rounded-lg border bg-white p-6">
        <div className="mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            onClick={checkUser}
            disabled={loading || !email || !password}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check User'}
          </button>
        </div>
      </div>

      {userInfo && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>About Provider Type:</strong>
          <br />
          • For email/password users, the provider should be "email"
          <br />
          • If it's empty, the user might have been created incorrectly
          <br />
          • In Supabase Dashboard, check: Authentication → Users → [Your User] → "Identity" tab
          <br />
          • You should see an identity with provider: "email"
        </p>
      </div>

      <div className="mt-4 rounded-lg border bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>If provider is empty or missing:</strong>
          <br />
          1. Delete the user in Supabase Dashboard
          <br />
          2. Create a new account via /signup
          <br />
          3. The new account should have provider: "email"
        </p>
      </div>
    </div>
  )
}
