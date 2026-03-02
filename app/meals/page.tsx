import { createClient } from '@/lib/supabase/server'
import { requireAuth, getCurrentUserProfile } from '@/lib/auth'
import { MealsTable } from '@/components/MealsTable'
import { MealsSearch } from '@/components/MealsSearch'
import { SearchProvider } from '@/components/SearchContext'

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  await requireAuth()
  const profile = await getCurrentUserProfile()
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  // Always fetch all meals, filtering will be done client-side
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*')
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching meals:', error)
  }

  return (
    <SearchProvider>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Meals</h1>
        </div>
        <MealsSearch initialSearch={resolvedSearchParams.search || ''} />
        <MealsTable initialMeals={meals || []} isAdmin={profile?.role === 'admin'} />
      </div>
    </SearchProvider>
  )
}
