import { Nav } from '@/components/Nav'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}
