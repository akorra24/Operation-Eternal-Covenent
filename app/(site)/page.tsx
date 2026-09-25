import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users to meals, unauthenticated to login
  if (user) {
    redirect('/meals')
  } else {
    redirect('/login')
  }
}
