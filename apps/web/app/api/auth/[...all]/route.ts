import { auth, toNextJsHandler } from "@workspace/auth/server"

export const runtime = "nodejs"

export const { GET, POST } = toNextJsHandler(auth)
