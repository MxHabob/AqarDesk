import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.midday.ai",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
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
