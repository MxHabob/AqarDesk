import { SettingsNavigation } from "@/components/management-navigation"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl">
      <SettingsNavigation />
      <main className="mt-8">{children}</main>
    </div>
  )
}
