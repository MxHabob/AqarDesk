"use client"

import { propertyTypeValues } from "@aqardesk/categories"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { Label } from "@aqardesk/ui/components/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { createListingAction } from "@/actions/listings/create-listing"
import { useScopedI18n } from "@/locales/client"
import { type ListingFormInput, listingFormSchema } from "./listing-form-schema"

export function ListingForm({ onCreated }: { onCreated: () => void }) {
  const t = useScopedI18n("listings")
  const common = useScopedI18n("common")
  const forms = useScopedI18n("forms")
  const propertyTypes = useScopedI18n("propertyTypes")
  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      propertyType: "building",
      listingType: "sale",
      city: "",
      district: "",
      area: "",
      price: "",
    },
  })
  const mutation = useMutation({
    mutationFn: async (values: ListingFormInput) => {
      const result = await createListingAction(values)
      if (!result?.data) {
        throw new Error(result?.serverError ?? t("createError"))
      }
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["listings"] })
      form.reset()
      onCreated()
      router.refresh()
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  function displayError(message?: string) {
    if (!message) return null
    return (
      <span className="text-xs text-destructive">
        {message === "required" ? forms("required") : forms("invalidNumber")}
      </span>
    )
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      {mutation.error && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message === "Forbidden"
            ? t("permissionError")
            : t("createError")}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="listing-title">{t("propertyTitle")}</Label>
        <Input
          id="listing-title"
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {displayError(errors.title?.message)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listing-property-type">{t("propertyType")}</Label>
          <select
            id="listing-property-type"
            className="h-10 w-full border border-input bg-background px-3 text-sm"
            {...register("propertyType")}
          >
            {propertyTypeValues.map((type) => (
              <option key={type} value={type}>
                {propertyTypes(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-type">{t("listingType")}</Label>
          <select
            id="listing-type"
            className="h-10 w-full border border-input bg-background px-3 text-sm"
            {...register("listingType")}
          >
            <option value="sale">{t("sale")}</option>
            <option value="rent">{t("rent")}</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listing-city">{t("city")}</Label>
          <Input id="listing-city" {...register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-district">{t("district")}</Label>
          <Input id="listing-district" {...register("district")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listing-area">{t("area")}</Label>
          <Input
            id="listing-area"
            inputMode="decimal"
            {...register("area")}
            aria-invalid={!!errors.area}
          />
          {displayError(errors.area?.message)}
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-price">{t("price")}</Label>
          <Input
            id="listing-price"
            inputMode="decimal"
            required
            {...register("price")}
            aria-invalid={!!errors.price}
          />
          {displayError(errors.price?.message)}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          variant="outline"
          type="button"
          disabled={mutation.isPending}
          onClick={() => onCreated()}
        >
          {common("cancel")}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? common("saving") : t("createAction")}
        </Button>
      </div>
    </form>
  )
}
