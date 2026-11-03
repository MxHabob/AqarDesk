import { SecondaryMenu } from "@/components/secondary-menu"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px]">
      <SecondaryMenu
        items={[
          { path: "/dashboard/settings", label: "General" },
          { path: "/dashboard/settings/members", label: "Members" },
        ]}
      />

      <main className="mt-8">{children}</main>
    </div>
  )
}
