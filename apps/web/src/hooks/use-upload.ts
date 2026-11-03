import { useState } from "react"
import {
  createAppUploadUrlAction,
  verifyAppUploadAction,
} from "@/actions/storage"

interface UploadParams {
  file: File
  path: string[]
  bucket: string
}

interface UploadResult {
  url: string
  path: string[]
}

function getContentType(file: File) {
  if (file.type) return file.type
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "csv") return "text/csv"
  if (extension === "xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
  if (extension === "xls") return "application/vnd.ms-excel"
  return ""
}

export function useUpload() {
  const [isLoading, setLoading] = useState<boolean>(false)

  const uploadFile = async ({
    file,
    path,
    bucket,
  }: UploadParams): Promise<UploadResult> => {
    setLoading(true)

    try {
      const contentType = getContentType(file)
      const uploadUrl = await createAppUploadUrlAction({
        bucket,
        path,
        fileName: file.name,
        contentType,
        sizeBytes: file.size,
      })
      const response = await fetch(uploadUrl.url, {
        method: uploadUrl.method,
        headers: uploadUrl.headers,
        body: file,
      })
      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`)
      }

      const { objectKey } = await verifyAppUploadAction({
        objectKey: uploadUrl.objectKey,
        contentType,
        sizeBytes: file.size,
      })

      return {
        url: objectKey,
        path: objectKey.split("/"),
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    uploadFile,
    isLoading,
  }
}
