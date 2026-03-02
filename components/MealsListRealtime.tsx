'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MealsList } from './MealsList'

interface Meal {
  code: string
  title: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  price: number | null
}

interface MealsListRealtimeProps {
  initialMeals: Meal[]
}

export function MealsListRealtime({ initialMeals }: MealsListRealtimeProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Set up realtime subscription for meal changes
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
          // Refresh the page data when any meal change is detected
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  return <MealsList meals={initialMeals} />
}
