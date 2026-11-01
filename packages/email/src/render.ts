import { render } from "@react-email/render"
import type { ReactNode } from "react"

export async function renderEmail(component: ReactNode) {
  return render(component)
}
