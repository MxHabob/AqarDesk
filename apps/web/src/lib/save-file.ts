export async function saveFile(blob: Blob, filename: string) {
  if (typeof document === "undefined") {
    throw new Error("Files can only be saved in a browser.")
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.rel = "noopener"
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
