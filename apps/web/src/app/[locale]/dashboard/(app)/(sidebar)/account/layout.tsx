import { AccountSecondaryMenu } from "@/components/account-secondary-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px]">
      <AccountSecondaryMenu />
      <main className="mt-8">{children}</main>
    </div>
  );
}
