import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { MealForm } from '@/components/MealForm'

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  await requireAdmin()
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
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Edit Meal</h1>
      <MealForm meal={meal} />
    </div>
  )
}
