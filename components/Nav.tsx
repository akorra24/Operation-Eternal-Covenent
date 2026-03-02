import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <nav className="no-print bg-white shadow-sm" style={{ borderBottom: '2px solid #F28C28' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/meals" className="flex items-center">
              <Image 
                src="/rfgweb.svg" 
                alt="Ready Fit Go" 
                width={150} 
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            {user && (
              <>
                <Link href="/meals" className="text-gray-700 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[#A7D748]/20 hover:text-gray-900 hover:backdrop-blur-sm">
                  Meals
                </Link>
                {profile?.role === 'admin' && (
                  <>
                    <Link href="/admin/meals/new" className="text-gray-700 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[#A7D748]/20 hover:text-gray-900 hover:backdrop-blur-sm">
                      New Meal
                    </Link>
                    <Link href="/admin/settings" className="text-gray-700 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[#A7D748]/20 hover:text-gray-900 hover:backdrop-blur-sm">
                      Settings
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.email} ({profile?.role || 'staff'})
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-gray-900 px-3 py-1.5 rounded-full transition-all duration-200 bg-[#A7D748]/20 backdrop-blur-sm font-normal"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-gray-900 px-3 py-1.5 rounded-full transition-all duration-200 bg-[#A7D748]/20 backdrop-blur-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
