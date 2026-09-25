'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [results, setResults] = useState<string[]>([])
  const supabase = createClient()

  async function testConnection() {
    const newResults: string[] = []
    
    // Test 1: Environment variables
    newResults.push('=== Environment Variables ===')
    newResults.push(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
    newResults.push(`SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
    
    // Test 2: Supabase client connection
    newResults.push('\n=== Supabase Connection ===')
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1)
      if (error) {
        newResults.push(`❌ Database Error: ${error.message}`)
      } else {
        newResults.push('✅ Database connection successful')
      }
    } catch (err: any) {
      newResults.push(`❌ Connection Error: ${err.message}`)
    }

    // Test 3: Auth status
    newResults.push('\n=== Authentication ===')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        newResults.push(`Auth Error: ${error.message}`)
      } else if (user) {
        newResults.push(`✅ User logged in: ${user.email}`)
      } else {
        newResults.push('ℹ️ No user logged in')
      }
    } catch (err: any) {
      newResults.push(`❌ Auth Error: ${err.message}`)
    }

    // Test 4: Check if tables exist
    newResults.push('\n=== Tables Check ===')
    const tables = ['meals', 'settings', 'profiles']
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(0)
        if (error) {
          newResults.push(`❌ ${table}: ${error.message}`)
        } else {
          newResults.push(`✅ ${table}: accessible`)
        }
      } catch (err: any) {
        newResults.push(`❌ ${table}: ${err.message}`)
      }
    }

    setResults(newResults)
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Supabase Connection Test</h1>
      <button
        onClick={testConnection}
        className="mb-6 rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Test Connection
      </button>
      {results.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm">{results.join('\n')}</pre>
        </div>
      )}
    </div>
  )
}
