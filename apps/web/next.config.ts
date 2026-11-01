import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/auth",
    "@workspace/database",
    "@workspace/ui",
  ],
}

export default nextConfig
