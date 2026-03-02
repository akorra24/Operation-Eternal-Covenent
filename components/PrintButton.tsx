'use client'

import { useRouter } from 'next/navigation'

export function PrintButton({ code }: { code: string }) {
  const router = useRouter()

  function handlePrint() {
    router.push(`/print/${code}`)
  }

  return (
    <button
      onClick={handlePrint}
      className="rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
    >
      Print Label
    </button>
  )
}
