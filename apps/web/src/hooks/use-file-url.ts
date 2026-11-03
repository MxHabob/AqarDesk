"use client"

import { useQuery } from "@tanstack/react-query"
import { getStorageReadUrlAction } from "@/actions/storage"

type FileUrlOptions =
  | {
      type: "proxy" | "download"
      filePath: string
      filename?: string
    }
  | {
      type: "invoice"
      invoiceId: string
      isReceipt?: boolean
    }
  | {
      type: "url"
      url: string
    }

function isDirectUrl(value: string) {
  return /^(https?:|data:|blob:)/i.test(value) || value.startsWith("/")
}

function getObjectKey(options: FileUrlOptions | null) {
  if (!options) return null
  if (options.type === "url") {
    return isDirectUrl(options.url) ? null : options.url
  }
  if (options.type === "invoice") return null
  return options.filePath.replace(/^vault\//, "")
}

export function useFileUrl(options: FileUrlOptions | null) {
  const objectKey = getObjectKey(options)
  const downloadFilename =
    options?.type === "download" ? options.filename : undefined
  const directUrl =
    options?.type === "url" && isDirectUrl(options.url) ? options.url : null
  const { data, isLoading, error } = useQuery({
    queryKey: ["storage", "read-url", objectKey, downloadFilename],
    queryFn: () =>
      getStorageReadUrlAction({ objectKey: objectKey!, downloadFilename }),
    enabled: Boolean(objectKey),
    staleTime: 3 * 60 * 1000,
  })

  return {
    url: directUrl ?? data?.url ?? null,
    isLoading: isLoading && !directUrl,
    hasFileKey: Boolean(directUrl ?? data?.url),
    error,
  }
}
