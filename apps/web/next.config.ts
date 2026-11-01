import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/auth",
    "@workspace/database",
    "@workspace/storage",
    "@workspace/ui",
  ],
}

export default nextConfig
