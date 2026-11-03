import { SecondaryMenu } from "@/components/secondary-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px]">
      <SecondaryMenu
        items={[
          { path: "/dashboard/account", label: "General" },
          {
            path: "/dashboard/account/date-and-locale",
            label: "Date & Locale",
          },
          { path: "/dashboard/account/security", label: "Security" },
          { path: "/dashboard/teams", label: "Teams" },
          { path: "/dashboard/account/support", label: "Support" },
        ]}
      />

      <main className="mt-8">{children}</main>
    </div>
  );
}
