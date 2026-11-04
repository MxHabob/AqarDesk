"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aqardesk/ui/components/command"
import { Skeleton } from "@aqardesk/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Building2, Tag, UsersRound } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { searchSystemAction } from "@/actions/search/global-search"
import { useRealEstateParams } from "@/hooks/use-real-estate-params"
import { useSearchStore } from "@/store/search"

type SearchType = "property" | "listing" | "owner"
type SearchItem = {
  id: string
  type: SearchType
  title: string
  subtitle?: string
  intent?: "create" | "details"
}

const groupNames: Record<SearchType, string> = {
  property: "العقارات",
  listing: "الإعلانات",
  owner: "الملاك",
}

const itemIcons = {
  property: Building2,
  listing: Tag,
  owner: UsersRound,
}

const shortcuts: SearchItem[] = [
  {
    id: "create-property",
    type: "property",
    title: "إضافة عقار",
    intent: "create",
  },
  {
    id: "create-listing",
    type: "listing",
    title: "إضافة إعلان",
    intent: "create",
  },
  {
    id: "create-owner",
    type: "owner",
    title: "إضافة مالك",
    intent: "create",
  },
]

function SearchResultItem({
  item,
  onSelect,
}: {
  item: SearchItem
  onSelect: (item: SearchItem) => void
}) {
  const Icon = itemIcons[item.type]

  return (
    <CommandItem
      value={item.id}
      onSelect={() => onSelect(item)}
      className="py-2"
    >
      <Icon className="size-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate">{item.title}</p>
        {item.subtitle && (
          <p className="truncate text-xs text-muted-foreground">
            {item.subtitle}
          </p>
        )}
      </div>
    </CommandItem>
  )
}

export function Search() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [navigationError, setNavigationError] = useState<string>()
  const setOpen = useSearchStore((state) => state.setOpen)
  const { setParams } = useRealEstateParams()
  const searchTerm = debouncedSearch.trim()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 200)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  const {
    data: results = [],
    isFetching,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["global-real-estate-search", searchTerm],
    queryFn: () => searchSystemAction(searchTerm),
    enabled: searchTerm.length >= 2,
  })

  const groupedData = useMemo(() => {
    const groups: Record<SearchType, SearchItem[]> = {
      property: [],
      listing: [],
      owner: [],
    }

    for (const item of results) {
      groups[item.type].push(item)
    }

    const matchingShortcuts = shortcuts.filter(
      (item) =>
        !searchTerm ||
        item.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    )

    for (const item of matchingShortcuts) {
      groups[item.type].push(item)
    }

    return (Object.keys(groupNames) as SearchType[])
      .map((type) => [type, groups[type]] as const)
      .filter(([, items]) => items.length > 0)
  }, [results, searchTerm])

  const selectItem = (item: SearchItem) => {
    const commonParams = {
      createProperty: null,
      propertyId: null,
      propertyMode: null,
      createListing: null,
      listingId: null,
      listingMode: null,
      createOwner: null,
      ownerId: null,
      ownerMode: null,
    }
    const intent = item.intent ?? "details"

    const params =
      item.type === "property"
        ? {
            ...commonParams,
            createProperty: intent === "create" || null,
            propertyId: intent === "details" ? item.id : null,
            propertyMode: intent === "details" ? ("details" as const) : null,
          }
        : item.type === "listing"
          ? {
              ...commonParams,
              createListing: intent === "create" || null,
              listingId: intent === "details" ? item.id : null,
              listingMode: intent === "details" ? ("details" as const) : null,
            }
          : {
              ...commonParams,
              createOwner: intent === "create" || null,
              ownerId: intent === "details" ? item.id : null,
              ownerMode: intent === "details" ? ("details" as const) : null,
            }

    void setParams(params)
      .then(() => {
        setNavigationError(undefined)
        setOpen(false)
      })
      .catch((navigationFailure: unknown) => {
        console.error(
          "Failed to open a global search result:",
          navigationFailure
        )
        setNavigationError("تعذر فتح النتيجة. حاول مرة أخرى.")
      })
  }

  return (
    <Command
      shouldFilter={false}
      className="search-container relative flex h-auto min-h-0 w-full flex-1 flex-col overflow-hidden border border-border bg-background p-0"
    >
      <div className="relative border-b border-border">
        <CommandInput
          autoFocus
          placeholder="ابحث عن عقار أو إعلان أو مالك..."
          value={search}
          onValueChange={(value) => {
            setSearch(value)
            setNavigationError(undefined)
          }}
          className="h-[55px] px-4 py-0"
        />
      </div>

      <CommandList className="global-search-list min-h-0 max-h-none flex-1 px-2">
        {isLoading && searchTerm.length >= 2 && (
          <div
            role="status"
            aria-label="جارٍ البحث"
            aria-busy="true"
            className="space-y-3 py-3"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index.toString()}
                className="flex items-center gap-3 rounded-md px-2 py-2"
              >
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {navigationError && (
          <p className="p-3 text-sm text-destructive" role="alert">
            {navigationError}
          </p>
        )}
        {error && (
          <p className="p-3 text-sm text-destructive" role="alert">
            تعذر البحث الآن. حاول مرة أخرى.
          </p>
        )}
        {!error && searchTerm.length === 1 && (
          <CommandEmpty>اكتب حرفين على الأقل للبحث.</CommandEmpty>
        )}
        {!error &&
          searchTerm.length >= 2 &&
          !isFetching &&
          results.length === 0 && (
            <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
          )}
        {groupedData.map(([type, items]) => (
          <CommandGroup key={type} heading={groupNames[type]}>
            {items.map((item) => (
              <SearchResultItem
                key={item.id}
                item={item}
                onSelect={selectItem}
              />
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}
