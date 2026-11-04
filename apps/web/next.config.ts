import type { NextConfig } from "next"

const imageCdnUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL
if (imageCdnUrl) {
  const parsedImageCdnUrl = new URL(imageCdnUrl)
  if (
    parsedImageCdnUrl.protocol !== "https:" ||
    parsedImageCdnUrl.pathname !== "/" ||
    parsedImageCdnUrl.search ||
    parsedImageCdnUrl.hash ||
    parsedImageCdnUrl.username ||
    parsedImageCdnUrl.password
  ) {
    throw new Error(
      "NEXT_PUBLIC_IMAGE_CDN_URL must be an HTTPS origin without a path, query, or credentials."
    )
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 75, 85, 90, 100],
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
