"use client"

import { Button } from "@aqardesk/ui/button"
import { Calendar, CalendarDayButton } from "@aqardesk/ui/calendar"
import { cn } from "@aqardesk/ui/cn"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@aqardesk/ui/dropdown-menu"
import { Icons } from "@aqardesk/ui/icons"
import { Check } from "lucide-react"
import { format, formatISO, parseISO } from "date-fns"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { useMetricsFilter } from "@/hooks/use-metrics-filter"
import { useUserQuery } from "@/hooks/use-user"
import { useI18n } from "@/locales/client"
import type { PeriodOption } from "@/utils/metrics-date-utils"

export function MetricsFilter() {
  const t = useI18n()
  const { data: user } = useUserQuery()
  const { period, from, to, updatePeriod, updateDateRange } = useMetricsFilter()

  const periodOptions: Array<{ value: PeriodOption; label: string }> = [
    { value: "3-months", label: t("metrics.threeMonths") },
    { value: "6-months", label: t("metrics.sixMonths") },
    { value: "this-year", label: t("metrics.thisYear") },
    { value: "1-year", label: t("metrics.oneYear") },
    { value: "2-years", label: t("metrics.twoYears") },
    { value: "5-years", label: t("metrics.fiveYears") },
    { value: "fiscal-year", label: t("metrics.fiscalYear") },
    { value: "custom", label: t("metrics.custom") },
  ]

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Convert from/to strings to DateRange
  const dateRange: DateRange | undefined =
    from && to
      ? {
          from: parseISO(from),
          to: parseISO(to),
        }
      : undefined

  const handleCustomDateSelect = (newDateRange?: DateRange) => {
    if (newDateRange?.from && newDateRange?.to) {
      updateDateRange(
        formatISO(newDateRange.from, { representation: "date" }),
        formatISO(newDateRange.to, { representation: "date" })
      )
    }
  }

  const getButtonLabel = () => {
    // If custom period, show date range
    if (period === "custom" && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
    }

    // Otherwise, show period label
    const option = periodOptions.find((opt) => opt.value === period)
    return option?.label || t("metrics.oneYear")
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 px-2">
          <Icons.Filter size={16} className="text-[#666]" />
          <span className="hidden sm:inline">{getButtonLabel()}</span>
          <Icons.ChevronDown size={16} className="text-[#666]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={10}>
        {/* PERIOD Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal px-2 py-1.5">
            {t("metrics.period")}
          </DropdownMenuLabel>
          {periodOptions.map((option) => {
            if (option.value === "custom") {
              const isCustomPeriod = String(period) === "custom"
              return (
                <DropdownMenuSub key={option.value}>
                  <DropdownMenuSubTrigger
                    className={cn(
                      "text-xs py-1.5 pl-4 pr-12 relative [&>svg]:hidden",
                      isCustomPeriod
                        ? "dark:bg-[#131313] dark:data-[state=open]:bg-[#131313] text-primary"
                        : "text-[#666]",
                      "hover:dark:bg-[#131313] hover:text-primary"
                    )}
                    onSelect={(e) => {
                      e.preventDefault()
                      if (!isCustomPeriod) {
                        updatePeriod(option.value)
                      }
                    }}
                  >
                    {option.label}
                    <span className="absolute right-2 flex items-center justify-center shrink-0">
                      {isCustomPeriod && <Check className="h-4 w-4 shrink-0" />}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-auto p-0" sideOffset={8}>
                    <Calendar
                      mode="range"
                      weekStartsOn={user?.weekStartsOnMonday ? 1 : 0}
                      selected={dateRange}
                      onSelect={handleCustomDateSelect}
                      disabled={(date) => date > new Date()}
                      defaultMonth={dateRange?.from}
                      numberOfMonths={2}
                      classNames={{
                        range_start: "bg-accent rounded-none",
                        range_end: "bg-accent rounded-none",
                        range_middle: "rounded-none",
                        today: "bg-transparent rounded-none",
                      }}
                      components={{
                        DayButton: ({
                          className,
                          day,
                          modifiers,
                          ...props
                        }) => (
                          <CalendarDayButton
                            day={day}
                            modifiers={modifiers}
                            {...props}
                            className={cn(
                              className,
                              "data-[selected-single=true]:!rounded-none",
                              "data-[range-start=true]:!rounded-none",
                              "data-[range-end=true]:!rounded-none",
                              "data-[range-middle=true]:!rounded-none",
                              "[&:hover]:!rounded-none"
                            )}
                          />
                        ),
                      }}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )
            }

            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={period === option.value}
                onCheckedChange={() => updatePeriod(option.value)}
                className={cn(
                  "text-xs",
                  period === option.value
                    ? "dark:bg-[#131313] text-primary"
                    : "text-[#666]",
                  "hover:dark:bg-[#131313]"
                )}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
