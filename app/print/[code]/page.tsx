'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

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
  shelf_life_days: number | null
}

interface Settings {
  default_shelf_life_days: number
  produced_by: string | null
}

export default function PrintPage() {
  const params = useParams()
  const code = params.code as string
  const [meal, setMeal] = useState<Meal | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const [mealResult, settingsResult] = await Promise.all([
        supabase.from('meals').select('*').eq('code', code).single(),
        supabase.from('settings').select('default_shelf_life_days, produced_by').eq('id', 1).single(),
      ])

      if (mealResult.data) setMeal(mealResult.data)
      if (settingsResult.data) setSettings(settingsResult.data)
      setLoading(false)
    }

    loadData()
  }, [code])

  useEffect(() => {
    if (meal?.title) {
      document.title = `Label for ${meal.title}`
    }
  }, [meal])

  useEffect(() => {
    if (!loading && meal && barcodeRef.current) {
      // Dynamically import jsbarcode to avoid SSR issues
      import('jsbarcode').then((JsBarcode) => {
        try {
          JsBarcode.default(barcodeRef.current, meal.code, {
            format: 'CODE128',
            width: 1,
            height: 10,
            displayValue: false,
            margin: 10,
          })
          
          // Auto print after a short delay to ensure barcode is rendered
          setTimeout(() => {
            window.print()
          }, 200)
        } catch (error) {
          console.error('Barcode generation error:', error)
          // Still print even if barcode fails
          setTimeout(() => {
            window.print()
          }, 200)
        }
      })
    }
  }, [loading, meal])

  if (loading || !meal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const shelfLifeDays = meal.shelf_life_days ?? settings?.default_shelf_life_days ?? 7
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + shelfLifeDays)

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const producedBy = settings?.produced_by || '1025 PCH, Hermosa Beach, 90254'

  return (
    <div className="rollo-print-root">
      <div className="rollo-label">
        <div className="rollo-logo">
          <img src="/rfgweb.svg" alt="Ready Fit Go" />
        </div>

        <div className="rollo-title">{meal.title}</div>

        <div className="rollo-barcode">
          <svg ref={barcodeRef} />
        </div>

        <div className="rollo-meta">
          <div>Sell By: {formatDate(expirationDate)}</div>
          <div className="rollo-produced">Produced By: {producedBy}</div>
        </div>

        <div className="rollo-nutrition">
          <div className="rollo-nutrition-title">Nutrition Facts</div>

          {meal.weight !== null && (
            <div className="rollo-weight">Net Weight: {meal.weight} g</div>
          )}

          {meal.calories !== null && (
            <div className="rollo-nutrition-row">
              <span>Calories</span>
              <span>{meal.calories}</span>
            </div>
          )}

          {meal.protein !== null && (
            <div className="rollo-nutrition-row">
              <span>Protein</span>
              <span>{meal.protein} g</span>
            </div>
          )}

          {meal.carbs !== null && (
            <div className="rollo-nutrition-row">
              <span>Carbs</span>
              <span>{meal.carbs} g</span>
            </div>
          )}

          {meal.sugar !== null && (
            <div className="rollo-nutrition-row">
              <span>Sugar</span>
              <span>{meal.sugar} g</span>
            </div>
          )}

          {meal.fat !== null && (
            <div className="rollo-nutrition-row">
              <span>Fat</span>
              <span>{meal.fat} g</span>
            </div>
          )}

          {meal.sodium !== null && (
            <div className="rollo-nutrition-row">
              <span>Sodium</span>
              <span>{meal.sodium} mg</span>
            </div>
          )}
        </div>

        {meal.instructions && (
          <div className="rollo-instructions">{meal.instructions}</div>
        )}

        {meal.ingredients && (
          <div className="rollo-ingredients">
            <div>
              <div>Ingredients:</div>
              <div>{meal.ingredients}</div>
            </div>
          </div>
        )}

        {meal.contains && (
          <div className="rollo-contains">
            <div>
              <div>Contains:</div>
              <div>{meal.contains}</div>
            </div>
          </div>
        )}
      </div>

      <div className="no-print" style={{ position: 'fixed', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
        <button
          onClick={() => window.print()}
          className="rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          Print Again
        </button>
        <div className="mt-4">
          <a href="/meals" className="text-blue-600 hover:text-blue-800">
            Back to meals
          </a>
        </div>
      </div>
    </div>
  )
}
