"use client"

import { Input } from "@aqardesk/ui/components/input"
import { useEffect, useState, useTransition } from "react"
import {
  deleteListingMediaAction,
  getListingMedia,
  getListingMediaUploadUrl,
  saveListingMediaAction,
} from "@/actions/real-estate"
import {
  RealEstateField,
  RealEstateFormError,
  RealEstateSubmitButton,
} from "@/components/forms/real-estate-fields"

type MediaRows = Awaited<ReturnType<typeof getListingMedia>>

export function ListingMediaForm({
  listingId,
  readOnly = false,
  onPendingChange,
}: {
  listingId: string
  readOnly?: boolean
  onPendingChange?: (pending: boolean) => void
}) {
  const [media, setMedia] = useState<MediaRows>([])
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  useEffect(() => {
    let active = true
    getListingMedia(listingId)
      .then((result) => {
        if (active) setMedia(result)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل ملفات الإعلان.")
      })
    return () => {
      active = false
    }
  }, [listingId])

  const handleUpload = (formData: FormData) => {
    if (!file) {
      setError("اختر ملفًا أولًا.")
      return
    }
    setError(undefined)

    startTransition(async () => {
      try {
        const type = String(formData.get("type")) as
          | "photo"
          | "floor_plan"
          | "video"
          | "document"
        const upload = await getListingMediaUploadUrl({
          listingId,
          type,
          contentType: file.type,
          sizeBytes: file.size,
        })
        const response = await fetch(upload.url, {
          method: upload.method,
          headers: upload.headers,
          body: file,
        })
        if (!response.ok) {
          throw new Error("فشل رفع الملف إلى مساحة التخزين.")
        }

        const metadata = new FormData()
        metadata.set("listingId", listingId)
        metadata.set("type", type)
        metadata.set("objectKey", upload.objectKey)
        metadata.set("contentType", file.type)
        metadata.set("sizeBytes", String(file.size))
        metadata.set("originalFilename", file.name)
        metadata.set("altText", String(formData.get("altText") ?? ""))
        const saved = await saveListingMediaAction({}, metadata)
        if (saved.error) {
          setError(saved.error)
          return
        }

        setFile(null)
        const input = document.getElementById(
          `listing-media-file-${listingId}`
        ) as HTMLInputElement | null
        if (input) input.value = ""
        setMedia(await getListingMedia(listingId))
      } catch (uploadError) {
        setError(
          uploadError instanceof Error ? uploadError.message : "تعذر رفع الملف."
        )
      }
    })
  }

  const handleDelete = (id: string) => {
    setError(undefined)
    startTransition(async () => {
      try {
        await deleteListingMediaAction(id)
        setMedia(await getListingMedia(listingId))
      } catch (deleteError) {
        setError(
          deleteError instanceof Error ? deleteError.message : "تعذر حذف الملف."
        )
      }
    })
  }

  return (
    <section className="space-y-5">
      <h3 className="border-b pb-2 text-sm font-medium">ملفات الإعلان</h3>
      {media.length ? (
        <ul className="space-y-2">
          {media.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {item.originalFilename || item.type}
                {item.altText ? ` — ${item.altText}` : ""}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  className="text-xs text-destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(item.id)}
                >
                  حذف
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">لا توجد ملفات مضافة.</p>
      )}

      {!readOnly && (
        <form action={handleUpload} className="space-y-4">
          <RealEstateField
            label="نوع الملف"
            name="type"
            type="select"
            defaultValue="photo"
            options={[
              { value: "photo", label: "صورة" },
              { value: "floor_plan", label: "مخطط" },
              { value: "video", label: "فيديو" },
              { value: "document", label: "مستند" },
            ]}
          />
          <RealEstateField
            label="وصف مختصر"
            name="altText"
            placeholder="وصف يظهر مع الصورة"
          />
          <label
            htmlFor={`listing-media-file-${listingId}`}
            className="flex flex-col gap-2 text-sm font-medium"
          >
            الملف
            <Input
              id={`listing-media-file-${listingId}`}
              type="file"
              accept="image/avif,image/heic,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span className="text-xs font-normal text-muted-foreground">
              اختر صورة أو مخططًا أو فيديو أو مستندًا لهذا الإعلان.
            </span>
          </label>
          {file && (
            <p className="text-xs text-muted-foreground">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          )}
          {error && <RealEstateFormError message={error} />}
          <RealEstateSubmitButton
            label="رفع الملف"
            disabled={!file || isPending}
          />
        </form>
      )}
      {readOnly && error && <RealEstateFormError message={error} />}
    </section>
  )
}
