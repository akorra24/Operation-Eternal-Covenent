'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Meal {
  code: string
  title: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  sugar: number | null
  sodium: number | null
  ingredients: string | null
  contains: string | null
  weight: number | null
  instructions: string | null
  price: number | null
  shelf_life_days: number | null
}

interface MealFormProps {
  meal?: Meal
}

export function MealForm({ meal }: MealFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: meal?.code || '',
    title: meal?.title || '',
    calories: meal?.calories?.toString() || '',
    protein: meal?.protein?.toString() || '',
    carbs: meal?.carbs?.toString() || '',
    fat: meal?.fat?.toString() || '',
    sugar: meal?.sugar?.toString() || '',
    sodium: meal?.sodium?.toString() || '',
    ingredients: meal?.ingredients || '',
    contains: meal?.contains || '',
    weight: meal?.weight?.toString() || '',
    instructions: meal?.instructions || '',
    price: meal?.price?.toString() || '',
    shelf_life_days: meal?.shelf_life_days?.toString() || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const data = {
      code: formData.code.trim(),
      title: formData.title.trim(),
      calories: formData.calories ? parseInt(formData.calories) : null,
      protein: formData.protein ? parseFloat(formData.protein) : null,
      carbs: formData.carbs ? parseFloat(formData.carbs) : null,
      fat: formData.fat ? parseFloat(formData.fat) : null,
      sugar: formData.sugar ? parseFloat(formData.sugar) : null,
      sodium: formData.sodium ? parseFloat(formData.sodium) : null,
      ingredients: formData.ingredients.trim() || null,
      contains: formData.contains.trim() || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      instructions: formData.instructions.trim() || null,
      price: formData.price ? parseFloat(formData.price) : null,
      shelf_life_days: formData.shelf_life_days ? parseInt(formData.shelf_life_days) : null,
    }

    try {
      if (meal) {
        // Update existing meal
        const { error: updateError } = await supabase
          .from('meals')
          .update(data)
          .eq('code', meal.code)

        if (updateError) throw updateError
      } else {
        // Create new meal
        const { error: insertError } = await supabase
          .from('meals')
          .insert([data])

        if (insertError) throw insertError
      }

      // Trigger revalidation
      router.push('/meals')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          id="code"
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          required
          disabled={!!meal}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
        />
        {meal && (
          <p className="mt-1 text-xs text-gray-500">Code cannot be changed after creation</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
            Calories
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
            Protein (g)
          </label>
          <input
            id="protein"
            type="number"
            min="0"
            step="0.1"
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
            Carbs (g)
          </label>
          <input
            id="carbs"
            type="number"
            min="0"
            step="0.1"
            value={formData.carbs}
            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sugar" className="block text-sm font-medium text-gray-700">
            Sugar (g)
          </label>
          <input
            id="sugar"
            type="number"
            min="0"
            step="0.1"
            value={formData.sugar}
            onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sodium" className="block text-sm font-medium text-gray-700">
            Sodium (mg)
          </label>
          <input
            id="sodium"
            type="number"
            min="0"
            step="0.1"
            value={formData.sodium}
            onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="fat" className="block text-sm font-medium text-gray-700">
            Fat (g)
          </label>
          <input
            id="fat"
            type="number"
            min="0"
            step="0.1"
            value={formData.fat}
            onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (g)
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          rows={3}
          value={formData.ingredients}
          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="contains" className="block text-sm font-medium text-gray-700">
          Contains (Allergens)
        </label>
        <input
          id="contains"
          type="text"
          value={formData.contains}
          onChange={(e) => setFormData({ ...formData, contains: e.target.value })}
          placeholder="e.g., Eggs, Milk, Wheat"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
          Instructions
        </label>
        <input
          id="instructions"
          type="text"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="e.g., Heat for 1-2 minutes"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="shelf_life_days" className="block text-sm font-medium text-gray-700">
          Shelf Life (days)
        </label>
        <input
          id="shelf_life_days"
          type="number"
          min="1"
          value={formData.shelf_life_days}
          onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Leave empty to use default (7 days)</p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : meal ? 'Update Meal' : 'Create Meal'}
        </button>
        <Link
          href="/meals"
          className="rounded border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
