'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSearch } from './SearchContext'

interface MealsSearchProps {
  initialSearch?: string
}

export function MealsSearch({ initialSearch = '' }: MealsSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSearch: setSearchContext } = useSearch()
  const [localSearch, setLocalSearch] = useState(initialSearch || searchParams.get('search') || '')
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Update context when local search changes
  useEffect(() => {
    setSearchContext(localSearch)
  }, [localSearch, setSearchContext])

  // Debounced search for URL update
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (localSearch) {
        params.set('search', localSearch)
      } else {
        params.delete('search')
      }
      router.push(`/meals?${params.toString()}`)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localSearch, router, searchParams])

  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search by title or code..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className={`w-full rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 border-[#A7D748] focus:border-[#A7D748] focus:ring-[#A7D748] transition-all duration-200 border-[1.5px] focus:border-[1.5px] ${
          localSearch.length > 0 ? 'backdrop-blur-sm bg-[#A7D748]/15' : ''
        }`}
      />
    </div>
  )
}
