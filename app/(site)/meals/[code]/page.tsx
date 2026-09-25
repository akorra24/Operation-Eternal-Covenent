import { createClient } from '@/lib/supabase/server'
import { requireAuth, getCurrentUserProfile } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrintButton } from '@/components/PrintButton'

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  await requireAuth()
  const profile = await getCurrentUserProfile()
  const supabase = await createClient()
  const resolvedParams = await params

  const { data: meal, error } = await supabase
    .from('meals')
    .select('*')
    .eq('code', resolvedParams.code)
    .single()

  if (error || !meal) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <Link href="/meals" className="text-blue-600 hover:text-blue-800">
          ← Back to meals
        </Link>
      </div>
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meal.title}</h1>
            <span className="mt-2 inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {meal.code}
            </span>
          </div>
          {profile?.role === 'admin' && (
            <Link
              href={`/admin/meals/${meal.code}/edit`}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {meal.calories !== null && (
            <div>
              <div className="text-sm text-gray-600">Calories</div>
              <div className="text-2xl font-bold text-gray-900">{meal.calories}</div>
            </div>
          )}
          {meal.protein !== null && (
            <div>
              <div className="text-sm text-gray-600">Protein</div>
              <div className="text-2xl font-bold text-gray-900">{meal.protein}g</div>
            </div>
          )}
          {meal.carbs !== null && (
            <div>
              <div className="text-sm text-gray-600">Carbs</div>
              <div className="text-2xl font-bold text-gray-900">{meal.carbs}g</div>
            </div>
          )}
          {meal.fat !== null && (
            <div>
              <div className="text-sm text-gray-600">Fat</div>
              <div className="text-2xl font-bold text-gray-900">{meal.fat}g</div>
            </div>
          )}
          {meal.sugar !== null && (
            <div>
              <div className="text-sm text-gray-600">Sugar</div>
              <div className="text-2xl font-bold text-gray-900">{meal.sugar}g</div>
            </div>
          )}
          {meal.sodium !== null && (
            <div>
              <div className="text-sm text-gray-600">Sodium</div>
              <div className="text-2xl font-bold text-gray-900">{meal.sodium}mg</div>
            </div>
          )}
        </div>

        {meal.weight !== null && (
          <div className="mb-6">
            <div className="text-sm text-gray-600">Net Weight</div>
            <div className="text-xl font-bold text-gray-900">{meal.weight}g</div>
          </div>
        )}

        {meal.ingredients && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Ingredients</h2>
            <p className="text-gray-700">{meal.ingredients}</p>
          </div>
        )}

        {meal.contains && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Contains</h2>
            <p className="text-gray-700">{meal.contains}</p>
          </div>
        )}

        {meal.instructions && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Instructions</h2>
            <p className="text-gray-700">{meal.instructions}</p>
          </div>
        )}

        {meal.price !== null && (
          <div className="mb-6">
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-2xl font-bold text-gray-900">
              ${meal.price.toFixed(2)}
            </div>
          </div>
        )}

        <div className="mt-8">
          <PrintButton code={meal.code} />
        </div>
      </div>
    </div>
  )
}
