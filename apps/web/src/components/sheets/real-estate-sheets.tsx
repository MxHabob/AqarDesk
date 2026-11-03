"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/components/sheet"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  getListingFormData,
  getOwnerFormData,
  getPropertyFormData,
  getPropertyOptions,
  getPropertyOwnerOptions,
} from "@/actions/real-estate"
import { ListingForm } from "@/components/forms/listing-form"
import { ListingMediaForm } from "@/components/forms/listing-media-form"
import { OwnerForm } from "@/components/forms/owner-form"
import { PropertyForm } from "@/components/forms/property-form"
import { useRealEstateParams } from "@/hooks/use-real-estate-params"

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label="إغلاق"
      onClick={onClose}
    >
      <X />
    </Button>
  )
}

export function PropertySheet() {
  const { createProperty, propertyId, propertyMode, setParams } =
    useRealEstateParams()
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getPropertyFormData>
  > | null>(null)
  const [owners, setOwners] = useState<
    Awaited<ReturnType<typeof getPropertyOwnerOptions>>
  >([])
  const [error, setError] = useState<string>()
  const isOpen = Boolean(createProperty || propertyId)
  const readOnly = propertyMode === "details"

  const close = () =>
    setParams({ createProperty: null, propertyId: null, propertyMode: null })

  useEffect(() => {
    let active = true
    setError(undefined)
    if (propertyId) {
      getPropertyFormData(propertyId)
        .then((result) => {
          if (active) setData(result)
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "تعذر تحميل بيانات العقار."
            )
          }
        })
    } else {
      setData(null)
    }

    if (isOpen) {
      getPropertyOwnerOptions()
        .then((result) => {
          if (active) setOwners(result)
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "تعذر تحميل قائمة الملاك."
            )
          }
        })
    }
    return () => {
      active = false
    }
  }, [isOpen, propertyId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="sm:max-w-2xl">
        <SheetHeader className="flex-row items-center justify-between border-b pb-4">
          <SheetTitle>
            {readOnly
              ? "تفاصيل العقار"
              : propertyId
                ? "تعديل العقار"
                : "إضافة عقار"}
          </SheetTitle>
          <CloseButton onClose={close} />
        </SheetHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : propertyId && !data ? (
          <p className="text-sm text-muted-foreground">جارٍ تحميل العقار...</p>
        ) : (
          <PropertyForm
            key={data?.property.id ?? "new-property"}
            data={data ?? undefined}
            ownerOptions={owners}
            readOnly={readOnly}
            onSaved={close}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

export function ListingSheet() {
  const { createListing, listingId, listingMode, setParams } =
    useRealEstateParams()
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getListingFormData>
  > | null>(null)
  const [properties, setProperties] = useState<
    Awaited<ReturnType<typeof getPropertyOptions>>
  >([])
  const [error, setError] = useState<string>()
  const isOpen = Boolean(createListing || listingId)
  const readOnly = listingMode === "details"
  const close = () =>
    setParams({ createListing: null, listingId: null, listingMode: null })

  useEffect(() => {
    let active = true
    setError(undefined)
    if (listingId) {
      getListingFormData(listingId)
        .then((result) => {
          if (active) setData(result)
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "تعذر تحميل الإعلان."
            )
          }
        })
    } else {
      setData(null)
    }
    if (isOpen) {
      getPropertyOptions()
        .then((result) => {
          if (active) setProperties(result)
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "تعذر تحميل العقارات."
            )
          }
        })
    }
    return () => {
      active = false
    }
  }, [isOpen, listingId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="sm:max-w-2xl">
        <SheetHeader className="flex-row items-center justify-between border-b pb-4">
          <SheetTitle>
            {readOnly
              ? "تفاصيل الإعلان"
              : listingId
                ? "تعديل الإعلان"
                : "إنشاء إعلان"}
          </SheetTitle>
          <CloseButton onClose={close} />
        </SheetHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : listingId && !data ? (
          <p className="text-sm text-muted-foreground">جارٍ تحميل الإعلان...</p>
        ) : (
          <div className="space-y-8">
            <ListingForm
              key={data?.listing.id ?? "new-listing"}
              data={data ?? undefined}
              properties={properties}
              readOnly={readOnly}
              onSaved={close}
            />
            {data?.listing.id && (
              <ListingMediaForm
                listingId={data.listing.id}
                readOnly={readOnly}
              />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function OwnerSheet() {
  const { createOwner, ownerId, ownerMode, setParams } = useRealEstateParams()
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getOwnerFormData>
  > | null>(null)
  const [error, setError] = useState<string>()
  const isOpen = Boolean(createOwner || ownerId)
  const readOnly = ownerMode === "details"
  const close = () =>
    setParams({ createOwner: null, ownerId: null, ownerMode: null })

  useEffect(() => {
    let active = true
    setError(undefined)
    if (ownerId) {
      getOwnerFormData(ownerId)
        .then((result) => {
          if (active) setData(result)
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "تعذر تحميل بيانات المالك."
            )
          }
        })
    } else {
      setData(null)
    }
    return () => {
      active = false
    }
  }, [ownerId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader className="flex-row items-center justify-between border-b pb-4">
          <SheetTitle>
            {readOnly
              ? "تفاصيل المالك"
              : ownerId
                ? "تعديل بيانات المالك"
                : "إضافة مالك"}
          </SheetTitle>
          <CloseButton onClose={close} />
        </SheetHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : ownerId && !data ? (
          <p className="text-sm text-muted-foreground">
            جارٍ تحميل بيانات المالك...
          </p>
        ) : (
          <OwnerForm
            key={data?.owner.id ?? "new-owner"}
            data={data ?? undefined}
            readOnly={readOnly}
            onSaved={close}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
