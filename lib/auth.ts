import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'staff'

export interface UserProfile {
  id: string
  role: UserRole
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  // Try getSession first, then getUser
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.log('getCurrentUser error:', error.message)
  }
  
  if (!user) {
    console.log('No user found. Session exists:', !!session)
    return null
  }

  return user
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    role: profile.role as UserRole,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const profile = await getCurrentUserProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/meals')
  }
  return profile
}
