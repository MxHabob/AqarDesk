import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.midday.ai",
      },
    ],
  },
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
