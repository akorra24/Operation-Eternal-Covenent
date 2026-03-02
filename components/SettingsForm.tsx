'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Settings {
  id: number
  default_shelf_life_days: number
}

interface SettingsFormProps {
  settings: Settings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [defaultShelfLife, setDefaultShelfLife] = useState(
    settings?.default_shelf_life_days.toString() || '7'
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('settings')
        .update({ default_shelf_life_days: parseInt(defaultShelfLife) })
        .eq('id', 1)

      if (updateError) throw updateError

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
        <label htmlFor="default_shelf_life_days" className="block text-sm font-medium text-gray-700">
          Default Shelf Life (days) <span className="text-red-500">*</span>
        </label>
        <input
          id="default_shelf_life_days"
          type="number"
          min="1"
          value={defaultShelfLife}
          onChange={(e) => setDefaultShelfLife(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          This is the default shelf life used when a meal doesn't specify its own shelf life.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
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
