import { createClient } from '@/lib/supabase/server'

export default async function TestServerAuthPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Get all cookies
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Server-Side Auth Test</h1>
      
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">User</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify({ user, userError: userError?.message }, null, 2)}
          </pre>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Session</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify({ 
              session: session ? 'Present' : 'Missing',
              sessionError: sessionError?.message 
            }, null, 2)}
          </pre>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">All Cookies</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
