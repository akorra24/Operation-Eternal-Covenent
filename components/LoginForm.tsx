'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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
        setError('Supabase environment variables are not configured. Please check your .env.local file.')
        setLoading(false)
        return
      }

      console.log('Attempting sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Sign in response:', { data, error })

      if (error) {
        console.error('Sign in error:', error)
        let errorMessage = error.message || 'Failed to sign in. Please check your credentials.'
        
        // Provide more helpful error messages
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials or create a new account.'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Please check your email for a confirmation link, or delete this user and create a new account.'
        }
        
        setError(errorMessage)
        setLoading(false)
      } else if (data?.user && data?.session) {
        console.log('Sign in successful:', data.user)
        console.log('Session:', data.session)
        
        // The @supabase/ssr browser client should automatically set cookies
        // But we need to ensure they're set before redirecting
        // Use router.push with refresh to ensure server-side sees the session
        router.push('/meals')
        router.refresh()
        
        // Also trigger a page reload after a short delay as backup
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/meals'
          }
        }, 1000)
      } else {
        setError('Sign in failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred. Please check the console.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#34A853' }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <div className="mt-4 space-y-2 text-center text-sm text-gray-600">
        <div>
          <Link href="/signup" className="text-blue-600 hover:text-blue-800">
            Don't have an account? Create one
          </Link>
        </div>
        <div className="text-xs text-gray-500">
          First time? Create an account first, then sign in.
        </div>
      </div>
    </form>
  )
}
