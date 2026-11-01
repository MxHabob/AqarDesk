import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aqardesk/auth",
    "@aqardesk/categories",
    "@aqardesk/database",
    "@aqardesk/email",
    "@aqardesk/notifications",
    "@aqardesk/storage",
    "@aqardesk/ui",
    "@aqardesk/utils",
    "@aqardesk/validators",
  ],
}

export default nextConfig
