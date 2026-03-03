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
        supabase.from('settings').select('default_shelf_life_days').eq('id', 1).single(),
      ])

      if (mealResult.data) setMeal(mealResult.data)
      if (settingsResult.data) setSettings(settingsResult.data)
      setLoading(false)
    }

    loadData()
  }, [code])

  useEffect(() => {
    if (!loading && meal && barcodeRef.current) {
      // Dynamically import jsbarcode to avoid SSR issues
      import('jsbarcode').then((JsBarcode) => {
        try {
          JsBarcode.default(barcodeRef.current, meal.code, {
            format: 'CODE128',
            width: 2.0,
            height: 40,
            displayValue: false,
            margin: 0,
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
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  return (
    <>
      {/* Print View - Simple Clean Layout */}
      <div className="print-label">
        {/* Logo */}
        <div className="print-logo-container">
          <img src="/logo.svg" alt="Logo" className="print-logo" />
        </div>

        {/* Title */}
        <div className="print-label-title">{meal.title}</div>

        {/* Barcode */}
        <div className="print-barcode-container">
          <svg ref={barcodeRef} className="print-barcode" />
          <div className="print-code">{meal.code}</div>
        </div>

        {/* Consume By */}
        <div className="print-meta">
          <div>Consume By: {formatDate(expirationDate)}</div>
        </div>

        {/* Nutrition Facts */}
        {(meal.calories !== null || meal.protein !== null || meal.carbs !== null || meal.fat !== null || meal.sugar !== null || meal.sodium !== null || meal.weight !== null) && (
          <div className="print-nutrition">
            <div className="print-nutrition-title">Nutrition Facts</div>
            
            {meal.weight !== null && (
              <div className="print-nutrition-row">
                <span>Net Weight:</span>
                <span>{meal.weight}g</span>
              </div>
            )}

            {meal.calories !== null && (
              <div className="print-nutrition-row">
                <span>Calories:</span>
                <span>{meal.calories}</span>
              </div>
            )}

            {meal.protein !== null && (
              <div className="print-nutrition-row">
                <span>Protein:</span>
                <span>{meal.protein}g</span>
              </div>
            )}

            {meal.carbs !== null && (
              <div className="print-nutrition-row">
                <span>Carbs:</span>
                <span>{meal.carbs}g</span>
              </div>
            )}

            {meal.sugar !== null && (
              <div className="print-nutrition-row">
                <span>Sugar:</span>
                <span>{meal.sugar}g</span>
              </div>
            )}

            {meal.sodium !== null && (
              <div className="print-nutrition-row">
                <span>Sodium:</span>
                <span>{meal.sodium}mg</span>
              </div>
            )}

            {meal.fat !== null && (
              <div className="print-nutrition-row">
                <span>Fat:</span>
                <span>{meal.fat}g</span>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {meal.instructions && (
          <div className="print-instructions">{meal.instructions}</div>
        )}

        {/* Ingredients */}
        {meal.ingredients && (
          <div className="print-ingredients">
            <span className="print-section-title">Ingredients:</span>
            <span className="print-section-text">{meal.ingredients}</span>
          </div>
        )}

        {/* Contains */}
        {meal.contains && (
          <div className="print-contains">
            <span className="print-section-title">Contains:</span>
            <span className="print-section-text">{meal.contains}</span>
          </div>
        )}
      </div>

      {/* Non-print controls */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          Print Again
        </button>
        <div className="mt-4">
          <a
            href="/meals"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to meals
          </a>
        </div>
      </div>
    </>
  )
}
