'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSearch } from './SearchContext'

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
  price: number | null
}

interface MealsTableProps {
  initialMeals: Meal[]
  isAdmin?: boolean
}

export function MealsTable({ initialMeals, isAdmin = false }: MealsTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const { search } = useSearch()
  const [meals, setMeals] = useState(initialMeals)
  const [isAdminUser, setIsAdminUser] = useState(isAdmin)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Filter meals client-side based on search
  const filteredMeals = useMemo(() => {
    if (!search) return meals
    
    const searchLower = search.toLowerCase()
    return meals.filter(
      (meal) =>
        meal.title.toLowerCase().includes(searchLower) ||
        meal.code.toLowerCase().includes(searchLower)
    )
  }, [meals, search])

  useEffect(() => {
    // Check admin status
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdminUser(profile?.role === 'admin' || false)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
        },
        () => {
          // Refetch meals on any change
          supabase
            .from('meals')
            .select('*')
            .order('code', { ascending: true })
            .then(({ data }) => {
              if (data) setMeals(data)
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  function handlePrint(code: string) {
    router.push(`/print/${code}`)
  }

  function handleEdit(code: string) {
    router.push(`/admin/meals/${code}/edit`)
  }

  function handleDeleteClick(code: string) {
    setShowDeleteConfirm(code)
  }

  async function handleDeleteConfirm(code: string) {
    const { error } = await supabase.from('meals').delete().eq('code', code)

    if (error) {
      alert('Error deleting meal: ' + error.message)
      return
    }

    setMeals(meals.filter((m) => m.code !== code))
    setShowDeleteConfirm(null)
    router.refresh()
  }

  function handleRowClick(code: string) {
    router.push(`/meals/${code}`)
  }

  if (filteredMeals.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        {meals.length === 0 
          ? 'No meals found. Create your first meal as an admin.'
          : search 
            ? `No meals found matching "${search}".`
            : 'No meals found. Create your first meal as an admin.'}
      </div>
    )
  }

  return (
    <>
      <div className="meals-table-container">
        <table className="meals-table">
          <tbody>
            {filteredMeals.map((meal) => (
              <tr key={meal.code} className="meals-table-row">
                <td 
                  className="meals-table-cell meals-table-title"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.title}</div>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.calories ?? '—'}</div>
                  <label>Calories</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.protein !== null ? `${meal.protein} g` : '—'}</div>
                  <label>Protein</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.carbs !== null ? `${meal.carbs} g` : '—'}</div>
                  <label>Carbs</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.sugar !== null ? `${meal.sugar} g` : '—'}</div>
                  <label>Sugar</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.sodium !== null ? `${meal.sodium} mg` : '—'}</div>
                  <label>Sodium</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.fat !== null ? `${meal.fat} g` : '—'}</div>
                  <label>Fat</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-text"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="meals-table-truncate" title={meal.ingredients || ''}>
                    {meal.ingredients || '—'}
                  </div>
                  <label>Ingredients</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-text"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="meals-table-truncate" title={meal.contains || ''}>
                    {meal.contains || '—'}
                  </div>
                  <label>Contains</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-numeric"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.weight !== null ? `${meal.weight}g` : '—'}</div>
                  <label>Net Weight</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-code"
                  onClick={() => handleRowClick(meal.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>{meal.code}</div>
                  <label>Item Code</label>
                </td>
                <td 
                  className="meals-table-cell meals-table-actions"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="meals-table-actions-container">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePrint(meal.code)
                      }}
                      className="meals-table-icon"
                      title="Print"
                    >
                      <span className="material-icons">print</span>
                    </button>
                    {isAdminUser && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit(meal.code)
                          }}
                          className="meals-table-icon"
                          title="Edit"
                        >
                          <span className="material-icons">create</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteClick(meal.code)
                          }}
                          className="meals-table-icon"
                          title="Delete"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Meal</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{meals.find(m => m.code === showDeleteConfirm)?.title}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
