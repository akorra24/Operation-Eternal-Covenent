'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FixUserPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [action, setAction] = useState<'delete' | 'confirm' | 'signin'>('signin')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleAction() {
    setResult(null)
    setLoading(true)

    try {
      if (action === 'delete') {
        // First sign in to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setResult(`Error: ${signInError.message}`)
          setLoading(false)
          return
        }

        if (signInData?.user) {
          // Delete the user (this requires admin access or the user themselves)
          const { error: deleteError } = await supabase.auth.admin.deleteUser(signInData.user.id)
          
          if (deleteError) {
            setResult(`Cannot delete user via client. Please delete from Supabase Dashboard: Authentication > Users`)
          } else {
            setResult('User deleted. You can now create a new account.')
          }
        }
      } else if (action === 'confirm') {
        // Try to resend confirmation email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        })

        if (resendError) {
          setResult(`Error: ${resendError.message}`)
        } else {
          setResult('Confirmation email sent! Check your inbox.')
        }
      } else if (action === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setResult(`Error: ${error.message}`)
        } else if (data?.user) {
          setResult('Sign in successful! Redirecting...')
          setTimeout(() => {
            window.location.href = '/meals'
          }, 1000)
        }
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Fix User Account</h1>
      
      <div className="mb-6 rounded-lg border bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>If email confirmation was enabled when you created your account:</strong>
          <br />
          Your account might be unconfirmed. You have two options:
        </p>
        <ol className="mt-2 list-inside list-decimal text-sm text-yellow-700">
          <li>Delete the old user and create a new one (recommended)</li>
          <li>Manually confirm the user in Supabase Dashboard</li>
        </ol>
      </div>

      <div className="mb-4 space-y-4 rounded-lg border bg-white p-6">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="signin">Try Sign In</option>
            <option value="confirm">Resend Confirmation Email</option>
            <option value="delete">Delete User (requires sign in first)</option>
          </select>
        </div>
        <button
          onClick={handleAction}
          disabled={loading || !email || !password}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Execute'}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Alternative: Delete user in Supabase Dashboard</strong>
          <br />
          1. Go to Supabase Dashboard → Authentication → Users
          <br />
          2. Find your user by email
          <br />
          3. Click the three dots menu → Delete
          <br />
          4. Then create a new account via /signup
        </p>
      </div>
    </div>
  )
}
