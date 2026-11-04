"use client"

import Image from "next/image"
import listingImageLoader from "@/lib/listings/image-loader"

type Props = {
  src: string
  alt: string
  sizes: string
  className?: string
}

export function ListingCoverImage({ src, alt, sizes, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      loader={listingImageLoader}
      sizes={sizes}
      className={className}
    />
  )
}
