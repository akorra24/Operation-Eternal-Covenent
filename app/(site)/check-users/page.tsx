'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CheckUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function checkUsers() {
    setLoading(true)
    try {
      // Note: This requires admin access or a service role key
      // For now, we'll just check the current session
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setUsers([{ error: authError.message }])
      } else if (user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setUsers([
          {
            id: user.id,
            email: user.email,
            email_confirmed: !!user.email_confirmed_at,
            created_at: user.created_at,
            profile: profile || { error: profileError?.message },
          },
        ])
      } else {
        setUsers([{ message: 'No user logged in. Please sign up first.' }])
      }
    } catch (err: any) {
      console.error('Error:', err)
      setUsers([{ error: err.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Check Users</h1>
      <button
        onClick={checkUsers}
        disabled={loading}
        className="mb-6 rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Current User'}
      </button>
      {users.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(users, null, 2)}
          </pre>
        </div>
      )}
      <div className="mt-6 rounded-lg border bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> To see all users, you need to check the Supabase Dashboard:
          Authentication → Users. This page only shows the currently logged-in user.
        </p>
      </div>
    </div>
  )
}
