import { requireAdmin } from '@/lib/auth'
import { MealForm } from '@/components/MealForm'

export default async function NewMealPage() {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">New Meal</h1>
      <MealForm />
    </div>
  )
}
