import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import { eq } from "drizzle-orm"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { ProfileCard } from "@/components/account/profile-card"
import { PageHeader } from "@/components/layout/page-header"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("account")
  return { title: t("title"), robots: { index: false, follow: false } }
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const [t, requestHeaders] = await Promise.all([
    getScopedI18n("account"),
    headers(),
  ])
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    notFound()
  }

  const [user] = await getDatabase()
    .select({
      name: schema.users.name,
      email: schema.users.email,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id))
    .limit(1)

  if (!user) {
    notFound()
  }

  return (
    <section className="space-y-5">
      <PageHeader title={t("title")} />
      <ProfileCard title={t("profileTitle")} name={user.name} email={user.email} />
    </section>
  )
}
