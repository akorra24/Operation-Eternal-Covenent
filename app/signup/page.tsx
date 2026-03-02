'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase environment variables are not configured.')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/meals`,
        },
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        setError(signUpError.message || 'Failed to create account.')
        setLoading(false)
      } else if (data?.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email already confirmed, auto sign in
          setSuccess(true)
          setLoading(false)
          setTimeout(() => {
            router.push('/meals')
            router.refresh()
          }, 1000)
        } else {
          // Email confirmation required
          setError(
            'Account created! Please check your email for a confirmation link. After confirming, you can sign in.'
          )
          setLoading(false)
        }
      } else {
        setError('Account creation failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-4 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Account Created!</h1>
            <p className="text-gray-600">Redirecting to meals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#34A853' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
