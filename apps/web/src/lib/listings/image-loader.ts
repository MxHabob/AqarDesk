import type { ImageLoaderProps } from "next/image"

const publicListingImagePath =
  /^\/api\/public\/listing-images\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function listingImageLoader({
  src,
  width,
  quality = 75,
}: ImageLoaderProps) {
  const cdnUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL
  if (!cdnUrl) return src

  const cdn = new URL(cdnUrl)
  const source = new URL(src, `${cdn.origin}/`)

  if (
    source.origin !== cdn.origin ||
    !publicListingImagePath.test(source.pathname)
  ) {
    return src
  }

  const imageWidth = Math.max(16, Math.min(4096, Math.round(width)))
  const imageQuality = Math.max(50, Math.min(90, Math.round(quality)))

  return new URL(
    `/cdn-cgi/image/width=${imageWidth},quality=${imageQuality},format=auto/${source.href}`,
    cdn.origin
  ).toString()
}
