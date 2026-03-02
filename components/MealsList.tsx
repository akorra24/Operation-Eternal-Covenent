import Link from 'next/link'

interface Meal {
  code: string
  title: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  price: number | null
}

export function MealsList({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        No meals found. {meals.length === 0 && 'Create your first meal as an admin.'}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {meals.map((meal) => (
        <Link
          key={meal.code}
          href={`/meals/${meal.code}`}
          className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{meal.title}</h2>
            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {meal.code}
            </span>
          </div>
          {meal.calories && (
            <div className="mt-2 text-sm text-gray-600">
              {meal.calories} cal
              {meal.protein && ` • ${meal.protein}g protein`}
            </div>
          )}
          {meal.price && (
            <div className="mt-2 text-sm font-medium text-gray-900">
              ${meal.price.toFixed(2)}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
