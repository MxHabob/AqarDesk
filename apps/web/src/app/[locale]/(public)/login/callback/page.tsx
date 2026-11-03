import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"

export default async function LoginCallback({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const roleKeys = await getUserRoleKeys(session.user.id)

  if (!getRoleDestination(roleKeys, locale)) {
    redirect(`/${locale}/login?error=role`)
  }

  redirect(`/${locale}`)
}
