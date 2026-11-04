"use client"

import { propertyCategories, type PropertyType } from "@aqardesk/categories"
import Link from "next/link"
import { useI18n } from "@/locales/client"
import { IconMap, MaterialIcon } from "../homepage/icon-mapping"

const propertyTypeIcons = {
  building: "account_balance",
  land: "scatter_plot",
  house_villa: "account_balance_wallet",
  investment: "trending_up",
  commercial: "receipt_long",
  warehouse: "folder_zip",
  yard: "filter_list",
  apartment: "widgets",
} as const satisfies Record<PropertyType, keyof typeof IconMap>

export function FeaturesGridSection() {
  const t = useI18n()
  const propertyTypeLabels: Record<PropertyType, string> = {
    building: t("propertyTypes.building"),
    land: t("propertyTypes.land"),
    house_villa: t("propertyTypes.house_villa"),
    investment: t("propertyTypes.investment"),
    commercial: t("propertyTypes.commercial"),
    warehouse: t("propertyTypes.warehouse"),
    yard: t("propertyTypes.yard"),
    apartment: t("propertyTypes.apartment"),
  }

  const renderCategory = (category: (typeof propertyCategories)[number]) => (
    <Link
      key={category.type}
      href={`/listings?propertyType=${category.type}`}
      className="flex flex-col items-center w-full sm:w-[150px]"
    >
      <div className="bg-secondary border border-border w-[60px] h-[60px] flex items-center justify-center rounded-none mb-4 hover:border-muted-foreground transition-all duration-200">
        <MaterialIcon
          name={propertyTypeIcons[category.type]}
          className="text-muted-foreground "
          size={24}
        />
      </div>
      <div className="flex flex-col items-center text-center">
        <h3 className="font-sans text-sm text-foreground leading-[21px]">
          {propertyTypeLabels[category.type]}
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-[21px]">
          {t("homeCategories.viewListings")}
        </p>
      </div>
    </Link>
  )

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center space-y-4 mb-10 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
            {t("homeCategories.title")}
          </h2>
          <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal max-w-2xl mx-auto px-4">
            {t("homeCategories.description")}
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:gap-10 max-w-sm sm:max-w-none mx-auto">
          <div className="grid grid-cols-2 gap-6 sm:flex sm:justify-center sm:gap-20">
            {propertyCategories.slice(0, 4).map(renderCategory)}
          </div>

          <div className="grid grid-cols-2 gap-6 sm:flex sm:justify-center sm:gap-20">
            {propertyCategories.slice(4).map(renderCategory)}
          </div>
        </div>
      </div>
    </section>
  )
}
