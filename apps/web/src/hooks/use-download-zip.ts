import { useMutation } from "@tanstack/react-query"
import JSZip from "jszip"
import { getStorageReadUrlsAction } from "@/actions/storage"
import { saveFile } from "@/lib/save-file"

function getFilenameFromPath(path: string) {
  return path.split("/").at(-1) || path
}

async function zipAndDownloadFiles(filePaths: string[]) {
  const objectKeys = filePaths.map((path) => path.replace(/^vault\//, ""))
  const readUrls = await getStorageReadUrlsAction(objectKeys)
  const zip = new JSZip()
  const fileNames = new Set<string>()

  await Promise.all(
    readUrls.map(async ({ url }, index) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Failed to download ${getFilenameFromPath(filePaths[index])}: ${response.statusText}`
        )
      }

      const baseName = getFilenameFromPath(filePaths[index])
      let filename = baseName
      let suffix = 1
      while (fileNames.has(filename)) {
        const extensionIndex = baseName.lastIndexOf(".")
        filename =
          extensionIndex > 0
            ? `${baseName.slice(0, extensionIndex)}-${suffix}${baseName.slice(extensionIndex)}`
            : `${baseName}-${suffix}`
        suffix += 1
      }
      fileNames.add(filename)
      zip.file(filename, await response.blob())
    })
  )

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })

  await saveFile(zipBlob, `download-${Date.now()}.zip`)
}

export function useDownloadZip() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: zipAndDownloadFiles,
  })

  return {
    handleDownloadZip: mutateAsync,
    isPending,
    error,
  }
}
