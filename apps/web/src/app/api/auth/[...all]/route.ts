import { auth, toNextJsHandler } from "@aqardesk/auth/server"

export const runtime = "nodejs"

export const { GET, POST } = toNextJsHandler(auth)
