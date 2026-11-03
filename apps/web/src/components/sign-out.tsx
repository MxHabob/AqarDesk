"use client"

import { createClient } from "@aqardesk/supabase/client"
import { DropdownMenuItem } from "@aqardesk/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignOut() {
  const [isLoading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    setLoading(true)

    await supabase.auth.signOut({
      scope: "local",
    })

    router.push("/login")
  }

  return (
    <DropdownMenuItem
      className="text-xs"
      data-track="User Signed Out"
      onClick={handleSignOut}
    >
      {isLoading ? "Loading..." : "Sign out"}
    </DropdownMenuItem>
  )
}
