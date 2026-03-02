import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { SettingsForm } from '@/components/SettingsForm'

export default async function SettingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching settings:', error)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}
