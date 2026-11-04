"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/components/sheet"
import { Skeleton } from "@aqardesk/ui/components/skeleton"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useState } from "react"
import {
  getListingFormData,
  getOwnerFormData,
  getPropertyDefaultCountryCode,
  getPropertyFormData,
  getPropertyOptions,
  getPropertyOwnerOptions,
} from "@/actions/real-estate"
import { ListingForm } from "@/components/forms/listing-form"
import { ListingMediaForm } from "@/components/forms/listing-media-form"
import { OwnerForm } from "@/components/forms/owner-form"
import { PropertyForm } from "@/components/forms/property-form"
import { RealEstateSubmitButton } from "@/components/forms/real-estate-fields"
import { ShareListingDialog } from "@/components/real-estate/share-listing-dialog"
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

function RealEstateFormSkeleton({ fields = 8 }: { fields?: number }) {
  return (
    <div
      role="status"
      aria-label="جارٍ تحميل النموذج"
      aria-busy="true"
      className="min-h-0 flex-1 space-y-6 overflow-y-auto"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index.toString()} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

function getLoadErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function PropertySheet() {
  const { createProperty, propertyId, propertyMode, setParams } =
    useRealEstateParams()
  const queryClient = useQueryClient()
  const isOpen = Boolean(createProperty || propertyId)
  const readOnly = propertyMode === "details"
  const propertyQuery = useQuery({
    queryKey: ["real-estate-sheet", "property", propertyId],
    queryFn: () =>
      propertyId ? getPropertyFormData(propertyId) : Promise.resolve(null),
    enabled: isOpen && Boolean(propertyId),
    staleTime: 30_000,
  })
  const ownersQuery = useQuery({
    queryKey: ["real-estate-sheet", "owner-options"],
    queryFn: getPropertyOwnerOptions,
    enabled: isOpen,
    staleTime: 30_000,
  })
  const countryQuery = useQuery({
    queryKey: ["real-estate-sheet", "default-country"],
    queryFn: getPropertyDefaultCountryCode,
    enabled: isOpen && Boolean(createProperty),
    staleTime: 30_000,
  })
  const data = propertyQuery.data
  const owners = ownersQuery.data ?? []
  const error = propertyQuery.error ?? ownersQuery.error ?? countryQuery.error
  const isFormLoading =
    isOpen &&
    ((Boolean(propertyId) && propertyQuery.isLoading) ||
      (Boolean(createProperty) && countryQuery.isLoading) ||
      ownersQuery.isLoading)

  const close = () =>
    setParams({ createProperty: null, propertyId: null, propertyMode: null })

  const handleSaved = () => {
    if (propertyId) {
      void queryClient.invalidateQueries({
        queryKey: ["real-estate-sheet", "property", propertyId],
      })
    }
    void queryClient.invalidateQueries({
      queryKey: ["real-estate-sheet", "property-options"],
    })
    close()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="end"
        className="sm:max-w-2xl"
        panelClassName="flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <SheetHeader className="mb-6 flex-row items-center justify-between">
          <SheetTitle className="text-xl font-normal">
            {readOnly
              ? "تفاصيل العقار"
              : propertyId
                ? "تعديل العقار"
                : "إضافة عقار"}
          </SheetTitle>
          <div className="flex items-center gap-2">
            {readOnly && data && (
              <ShareListingDialog listings={data.shareableListings} />
            )}
            <CloseButton onClose={close} />
          </div>
        </SheetHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {getLoadErrorMessage(error, "تعذر تحميل بيانات العقار.")}
          </p>
        ) : isFormLoading ? (
          <RealEstateFormSkeleton />
        ) : propertyId && !data ? (
          <p className="text-sm text-destructive" role="alert">
            تعذر العثور على العقار.
          </p>
        ) : (
          <div className="min-h-0 flex-1">
            <PropertyForm
              key={data?.property.id ?? "new-property"}
              data={data ?? undefined}
              ownerOptions={owners}
              defaultCountryCode={countryQuery.data ?? "SA"}
              readOnly={readOnly}
              onSaved={handleSaved}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function ListingSheet() {
  const { createListing, listingId, listingMode, setParams } =
    useRealEstateParams()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const isOpen = Boolean(createListing || listingId)
  const readOnly = listingMode === "details"
  const listingQuery = useQuery({
    queryKey: ["real-estate-sheet", "listing", listingId],
    queryFn: () =>
      listingId ? getListingFormData(listingId) : Promise.resolve(null),
    enabled: isOpen && Boolean(listingId),
    staleTime: 30_000,
  })
  const propertiesQuery = useQuery({
    queryKey: ["real-estate-sheet", "property-options"],
    queryFn: getPropertyOptions,
    enabled: isOpen,
    staleTime: 30_000,
  })
  const data = listingQuery.data
  const properties = propertiesQuery.data ?? []
  const error = listingQuery.error ?? propertiesQuery.error
  const close = () =>
    setParams({ createListing: null, listingId: null, listingMode: null })
  const isFormLoading =
    isOpen &&
    ((Boolean(listingId) && listingQuery.isLoading) ||
      propertiesQuery.isLoading)

  const handleSaved = () => {
    if (listingId) {
      void queryClient.invalidateQueries({
        queryKey: ["real-estate-sheet", "listing", listingId],
      })
    }
    close()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="end"
        className="sm:max-w-2xl"
        panelClassName="flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <SheetHeader className="mb-6 flex-row items-center justify-between">
          <SheetTitle className="text-xl font-normal">
            {readOnly
              ? "تفاصيل الإعلان"
              : listingId
                ? "تعديل الإعلان"
                : "إنشاء إعلان"}
          </SheetTitle>
          <div className="flex items-center gap-2">
            {readOnly && data && (
              <ShareListingDialog
                listings={
                  data.listing.status === "active" &&
                  !data.property.archivedAt &&
                  (!data.listing.expiresAt ||
                    data.listing.expiresAt > new Date())
                    ? [
                        {
                          id: data.listing.id,
                          title: data.property.title,
                          listingType: data.listing.type,
                        },
                      ]
                    : []
                }
              />
            )}
            <CloseButton onClose={close} />
          </div>
        </SheetHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {getLoadErrorMessage(error, "تعذر تحميل الإعلان.")}
          </p>
        ) : isFormLoading ? (
          <RealEstateFormSkeleton />
        ) : listingId && !data ? (
          <p className="text-sm text-destructive" role="alert">
            تعذر العثور على الإعلان.
          </p>
        ) : (
          <div className="scrollbar-hide min-h-0 flex-1 space-y-8 overflow-y-auto">
            <ListingForm
              key={data?.listing.id ?? "new-listing"}
              data={data ?? undefined}
              properties={properties}
              readOnly={readOnly}
              onSaved={handleSaved}
              showSubmitButton={false}
              onPendingChange={setIsSaving}
            />
            {data?.listing.id && (
              <ListingMediaForm
                listingId={data.listing.id}
                readOnly={readOnly}
              />
            )}
          </div>
        )}
        {!readOnly && !isFormLoading && !error && (
          <SheetFooter className="-mx-6 mt-4 border-t bg-[#fafaf9] px-6 pb-2 pt-4 dark:bg-[#0c0c0c]">
            <RealEstateSubmitButton
              label={listingId ? "حفظ الإعلان" : "إنشاء الإعلان"}
              form="listing-form"
              className="w-full"
              pending={isSaving}
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function OwnerSheet() {
  const { createOwner, ownerId, ownerMode, setParams } = useRealEstateParams()
  const queryClient = useQueryClient()
  const isOpen = Boolean(createOwner || ownerId)
  const readOnly = ownerMode === "details"
  const ownerQuery = useQuery({
    queryKey: ["real-estate-sheet", "owner", ownerId],
    queryFn: () =>
      ownerId ? getOwnerFormData(ownerId) : Promise.resolve(null),
    enabled: isOpen && Boolean(ownerId),
    staleTime: 30_000,
  })
  const data = ownerQuery.data
  const close = () =>
    setParams({ createOwner: null, ownerId: null, ownerMode: null })

  const handleSaved = () => {
    if (ownerId) {
      void queryClient.invalidateQueries({
        queryKey: ["real-estate-sheet", "owner", ownerId],
      })
    }
    void queryClient.invalidateQueries({
      queryKey: ["real-estate-sheet", "owner-options"],
    })
    close()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="end"
        className="sm:max-w-xl"
        panelClassName="flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <SheetHeader className="mb-6 flex-row items-center justify-between">
          <SheetTitle className="text-xl font-normal">
            {readOnly
              ? "تفاصيل المالك"
              : ownerId
                ? "تعديل بيانات المالك"
                : "إضافة مالك"}
          </SheetTitle>
          <CloseButton onClose={close} />
        </SheetHeader>
        {ownerQuery.error ? (
          <p className="text-sm text-destructive" role="alert">
            {getLoadErrorMessage(ownerQuery.error, "تعذر تحميل بيانات المالك.")}
          </p>
        ) : ownerId && ownerQuery.isLoading ? (
          <RealEstateFormSkeleton fields={5} />
        ) : ownerId && !data ? (
          <p className="text-sm text-destructive" role="alert">
            تعذر العثور على بيانات المالك.
          </p>
        ) : (
          <div className="min-h-0 flex-1">
            <OwnerForm
              key={data?.owner.id ?? "new-owner"}
              data={data ?? undefined}
              readOnly={readOnly}
              onSaved={handleSaved}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
