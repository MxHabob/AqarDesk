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
import { useCallback, useState } from "react"
import {
  getListingFormData,
  getOwnerFormData,
  getPropertyDefaultCountryCode,
  getPropertyFieldSettingsAction,
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
import { useCurrentLocale, useScopedI18n } from "@/locales/client"

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

function ListingHistory({
  history,
}: {
  history: NonNullable<
    Awaited<ReturnType<typeof getListingFormData>>
  >["history"]
}) {
  const t = useScopedI18n("operationsManagement")
  const locale = useCurrentLocale()
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const priceFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  })
  const statusLabels: Record<string, string> = {
    draft: t("draft"),
    active: t("active"),
    reserved: t("reserved"),
    sold: t("sold"),
    rented: t("rented"),
    expired: t("expiredListing"),
    withdrawn: t("withdrawn"),
  }
  const priceRows = history.prices.map((entry) => ({
    id: entry.id,
    date: entry.changedAt,
    value: entry.salePrice ?? entry.monthlyRent,
  }))
  const statusRows = history.statuses.map((entry) => ({
    id: entry.id,
    date: entry.changedAt,
    value: statusLabels[entry.status] ?? entry.status,
    note: entry.note,
  }))

  return (
    <section className="space-y-5 border-t border-border pt-6">
      <h2 className="text-lg font-medium">{t("listingHistory")}</h2>
      {priceRows.length === 0 && statusRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
      ) : (
        <>
          {priceRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("priceHistory")}</h3>
              <ul className="divide-y divide-border border-y border-border">
                {priceRows.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span>
                      {entry.value
                        ? priceFormatter.format(Number(entry.value))
                        : "—"}
                    </span>
                    <time
                      dateTime={entry.date.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(entry.date)}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {statusRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("statusHistory")}</h3>
              <ul className="divide-y divide-border border-y border-border">
                {statusRows.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <span>
                      {entry.value}
                      {entry.note ? ` — ${entry.note}` : ""}
                    </span>
                    <time
                      dateTime={entry.date.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(entry.date)}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
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
  const fieldSettingsQuery = useQuery({
    queryKey: ["real-estate-sheet", "property-field-settings"],
    queryFn: getPropertyFieldSettingsAction,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })
  const data = propertyQuery.data
  const owners = ownersQuery.data ?? []
  const error =
    propertyQuery.error ??
    ownersQuery.error ??
    countryQuery.error ??
    fieldSettingsQuery.error
  const isFormLoading =
    isOpen &&
    ((Boolean(propertyId) && propertyQuery.isLoading) ||
      (Boolean(createProperty) && countryQuery.isLoading) ||
      ownersQuery.isLoading ||
      fieldSettingsQuery.isLoading)

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
              fieldSettings={fieldSettingsQuery.data}
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
  const [isMediaPending, setIsMediaPending] = useState(false)
  const [workflowListingId, setWorkflowListingId] = useState<string | null>(
    null
  )
  const [workflowStep, setWorkflowStep] = useState<
    "details" | "media" | "review"
  >("details")
  const isOpen = Boolean(createListing || listingId)
  const isCreateWorkflow = Boolean(createListing && !listingId)
  const formListingId = listingId ?? workflowListingId
  const readOnly = listingMode === "details"
  const listingQuery = useQuery({
    queryKey: ["real-estate-sheet", "listing", formListingId],
    queryFn: () =>
      formListingId ? getListingFormData(formListingId) : Promise.resolve(null),
    enabled: isOpen && Boolean(formListingId),
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
  const close = useCallback(() => {
    setWorkflowListingId(null)
    setWorkflowStep("details")
    setIsMediaPending(false)
    setParams({ createListing: null, listingId: null, listingMode: null })
  }, [setParams])
  const isFormLoading =
    isOpen &&
    ((Boolean(formListingId) && listingQuery.isLoading) ||
      propertiesQuery.isLoading)

  const handleSaved = useCallback(
    (savedListingId: string) => {
      if (isCreateWorkflow && !workflowListingId) {
        setWorkflowListingId(savedListingId)
        setWorkflowStep("media")
        return
      }
      void queryClient.invalidateQueries({
        queryKey: ["real-estate-sheet", "listing", savedListingId],
      })
      close()
    },
    [close, isCreateWorkflow, queryClient, workflowListingId]
  )
  const isMediaStep =
    isCreateWorkflow && Boolean(workflowListingId) && workflowStep === "media"
  const isReviewStep =
    isCreateWorkflow && Boolean(workflowListingId) && workflowStep === "review"

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
            {isMediaStep
              ? "إضافة صور وملفات الإعلان"
              : isReviewStep
                ? "مراجعة الإعلان ونشره"
                : readOnly
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
        {isCreateWorkflow && (
          <ol
            aria-label="خطوات إنشاء الإعلان"
            className="mb-5 grid grid-cols-3 gap-2 text-center text-xs"
          >
            {[
              { step: "details", label: "البيانات" },
              { step: "media", label: "الصور" },
              { step: "review", label: "المراجعة والنشر" },
            ].map(({ step, label }, index) => {
              const isCurrent = workflowStep === step
              const isComplete =
                (workflowStep === "media" && index === 0) ||
                (workflowStep === "review" && index < 2)
              return (
                <li
                  key={step}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`border-b-2 pb-2 ${
                    isCurrent || isComplete
                      ? "border-foreground font-medium text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {index + 1}. {label}
                </li>
              )
            })}
          </ol>
        )}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {getLoadErrorMessage(error, "تعذر تحميل الإعلان.")}
          </p>
        ) : isFormLoading ? (
          <RealEstateFormSkeleton />
        ) : formListingId && !data ? (
          <p className="text-sm text-destructive" role="alert">
            تعذر العثور على الإعلان.
          </p>
        ) : isMediaStep && workflowListingId ? (
          <div className="scrollbar-hide min-h-0 flex-1 space-y-4 overflow-y-auto">
            <p className="text-sm leading-6 text-muted-foreground">
              ارفع صور العقار ومخططاته الآن، أو تابع وأضفها لاحقًا من تعديل
              الإعلان.
            </p>
            <ListingMediaForm
              listingId={workflowListingId}
              onPendingChange={setIsMediaPending}
            />
          </div>
        ) : (
          <div className="scrollbar-hide min-h-0 flex-1 space-y-8 overflow-y-auto">
            <ListingForm
              key={`${data?.listing.id ?? "new-listing"}-${workflowStep}`}
              data={data ?? undefined}
              properties={properties}
              readOnly={readOnly}
              onSaved={handleSaved}
              showSubmitButton={false}
              onPendingChange={setIsSaving}
              createAsDraft={isCreateWorkflow && !workflowListingId}
            />
            {listingId && data?.listing.id && (
              <ListingMediaForm
                listingId={data.listing.id}
                readOnly={readOnly}
              />
            )}
            {readOnly && data?.history && (
              <ListingHistory history={data.history} />
            )}
          </div>
        )}
        {!readOnly && !isFormLoading && !error && (
          <SheetFooter className="-mx-6 mt-4 border-t bg-[#fafaf9] px-6 pb-2 pt-4 dark:bg-[#0c0c0c]">
            {isMediaStep ? (
              <Button
                type="button"
                className="w-full"
                disabled={isMediaPending}
                onClick={() => setWorkflowStep("review")}
              >
                متابعة للمراجعة والنشر
              </Button>
            ) : (
              <div className="flex w-full gap-2">
                {isReviewStep && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWorkflowStep("media")}
                  >
                    رجوع للصور
                  </Button>
                )}
                <RealEstateSubmitButton
                  label={
                    isReviewStep
                      ? "حفظ وإنهاء"
                      : isCreateWorkflow
                        ? "حفظ كمسودة ومتابعة للصور"
                        : listingId
                          ? "حفظ الإعلان"
                          : "إنشاء الإعلان"
                  }
                  form="listing-form"
                  className="w-full"
                  pending={isSaving}
                />
              </div>
            )}
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
