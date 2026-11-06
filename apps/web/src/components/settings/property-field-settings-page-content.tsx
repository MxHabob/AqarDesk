"use client"

import {
  type PropertyFieldSetting,
  type PropertyType,
  propertyFieldsByType,
  propertyTypeValues,
} from "@aqardesk/categories"
import { Checkbox } from "@aqardesk/ui/components/checkbox"
import { Input } from "@aqardesk/ui/input"
import { useToast } from "@aqardesk/ui/use-toast"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { savePropertyFieldSettingsAction } from "@/actions/property-field-settings"
import { PropertyFieldSettingsForm } from "@/components/settings/property-field-settings-form"
import { useScopedI18n } from "@/locales/client"

export function PropertyFieldSettingsPageContent({
  locale,
  selectedType,
  fieldSettings,
  saved,
}: {
  locale: string
  selectedType: PropertyType
  fieldSettings: Record<string, PropertyFieldSetting>
  saved: boolean
}) {
  const t = useScopedI18n("propertyFieldSettings")
  const { toast } = useToast()
  const toastShown = useRef(false)

  useEffect(() => {
    if (saved && !toastShown.current) {
      toastShown.current = true
      toast({
        type: "success",
        timeout: 2500,
        title: t("saved"),
      })
    }
  }, [saved, toast, t])

  const fieldLabels: Record<string, string> = {
    title: t("fields.propertyName"),
    description: t("fields.description"),
    city: t("fields.city"),
    district: t("fields.district"),
    neighborhood: t("fields.neighborhood"),
    address: t("fields.address"),
    primaryStreet: t("fields.primaryStreet"),
    secondaryStreet: t("fields.secondaryStreet"),
    lotAreaM2: t("fields.lotAreaM2"),
    buildingAreaM2: t("fields.buildingAreaM2"),
    frontageM: t("fields.frontageM"),
    depthM: t("fields.depthM"),
    latitude: t("fields.latitude"),
    longitude: t("fields.longitude"),
    currentFloors: t("fields.currentFloors"),
    constructionDesign: t("fields.constructionDesign"),
    deedIssuer: t("fields.deedIssuer"),
    apartmentCount: t("fields.apartmentCount"),
    finish: t("fields.finish"),
    hasYard: t("fields.hasYard"),
    hasReception: t("fields.hasReception"),
    isFurnished: t("fields.isFurnished"),
    hasBasement: t("fields.hasBasement"),
    hasGuardRoom: t("fields.hasGuardRoom"),
    investmentType: t("fields.investmentType"),
    additionalDetails: t("fields.additionalDetails"),
    propertySubtype: t("fields.propertySubtype"),
    previousActivity: t("fields.previousActivity"),
    openingCount: t("fields.openingCount"),
    toiletCount: t("fields.toiletCount"),
    hasStorage: t("fields.hasStorage"),
    storageDetails: t("fields.storageDetails"),
    requestedActivity: t("fields.requestedActivity"),
    hasFence: t("fields.hasFence"),
    hasRoof: t("fields.hasRoof"),
    roomCount: t("fields.roomCount"),
    kitchenDetails: t("fields.kitchenDetails"),
    hasSeparateMajlis: t("fields.hasSeparateMajlis"),
    entranceCount: t("fields.entranceCount"),
    floorNumber: t("fields.floorNumber"),
    buildingType: t("fields.buildingType"),
    preferredTenant: t("fields.preferredTenant"),
  }
  const typeLabels: Record<PropertyType, string> = {
    building: t("types.building"),
    land: t("types.land"),
    house_villa: t("types.house_villa"),
    investment: t("types.investment"),
    commercial: t("types.commercial"),
    warehouse: t("types.warehouse"),
    yard: t("types.yard"),
    apartment: t("types.apartment"),
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
        {propertyTypeValues.map((type) => (
          <Link
            key={type}
            href={`/${locale}/dashboard/settings/fields?type=${type}`}
            aria-current={type === selectedType ? "page" : undefined}
            className={`border px-3 py-2 text-sm ${
              type === selectedType
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {typeLabels[type]}
          </Link>
        ))}
      </nav>

      <PropertyFieldSettingsForm action={savePropertyFieldSettingsAction}>
        <input type="hidden" name="type" value={selectedType} />
        <input type="hidden" name="locale" value={locale} />
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-start">
              <tr>
                <th scope="col" className="p-3 text-start font-medium">
                  {t("field")}
                </th>
                <th scope="col" className="p-3 text-start font-medium">
                  {t("label")}
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  {t("managementForm")}
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  {t("publicPage")}
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  {t("required")}
                </th>
                <th scope="col" className="p-3 text-start font-medium">
                  {t("order")}
                </th>
              </tr>
            </thead>
            <tbody>
              {propertyFieldsByType[selectedType].map((field, index) => {
                const config = fieldSettings[field.key]
                const fieldLabel = fieldLabels[field.key] ?? field.key
                const isTitle = field.key === "title"
                return (
                  <tr key={field.key} className="border-t border-border">
                    <th scope="row" className="p-3 text-start font-normal">
                      {fieldLabel}
                      {isTitle && (
                        <span className="ms-1 text-xs text-muted-foreground">
                          {t("basic")}
                        </span>
                      )}
                    </th>
                    <td className="p-2">
                      <Input
                        aria-label={t("customLabelFor", { field: fieldLabel })}
                        name={`label_${field.key}`}
                        defaultValue={config?.label ?? fieldLabel}
                        maxLength={100}
                        className="bg-background px-2"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Checkbox
                        name={`form_${field.key}`}
                        defaultChecked={
                          isTitle || config?.visibleInForm !== false
                        }
                        disabled={isTitle}
                        aria-label={t("showInForm", { field: fieldLabel })}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Checkbox
                        name={`public_${field.key}`}
                        defaultChecked={
                          isTitle ||
                          (config?.visiblePublicly ??
                            ![
                              "address",
                              "primaryStreet",
                              "secondaryStreet",
                            ].includes(field.key))
                        }
                        disabled={isTitle}
                        aria-label={t("showPublicly", { field: fieldLabel })}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Checkbox
                        name={`required_${field.key}`}
                        defaultChecked={isTitle || config?.required === true}
                        disabled={isTitle}
                        aria-label={t("markRequired", { field: fieldLabel })}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        name={`order_${field.key}`}
                        min={0}
                        max={999}
                        defaultValue={config?.order ?? index}
                        aria-label={t("orderFor", { field: fieldLabel })}
                        className="w-20 bg-background px-2"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </PropertyFieldSettingsForm>
    </section>
  )
}
