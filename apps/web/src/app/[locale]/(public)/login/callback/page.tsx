import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"

export default async function LoginCallback({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string }>
}) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams])
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const roleKeys = await getUserRoleKeys(session.user.id)

  if (!getRoleDestination(roleKeys, locale)) {
    redirect(`/${locale}/login?error=role`)
  }

  redirect(getSafeReturnPath(next, locale) ?? `/${locale}`)
}

function getSafeReturnPath(value: string | undefined, locale: string) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return null
  }

  try {
    const url = new URL(value, "https://aqardesk.invalid")
    const localeRoot = `/${locale}`
    const callbackPath = `${localeRoot}/login/callback`

    if (
      url.origin !== "https://aqardesk.invalid" ||
      (url.pathname !== localeRoot &&
        !url.pathname.startsWith(`${localeRoot}/`)) ||
      url.pathname === callbackPath
    ) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
