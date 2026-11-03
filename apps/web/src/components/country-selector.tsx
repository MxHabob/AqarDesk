import { Button } from "@aqardesk/ui/button"
import { cn } from "@aqardesk/ui/cn"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aqardesk/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@aqardesk/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useEffect } from "react"

const countries = [
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "BH", name: "Bahrain" },
  { code: "KW", name: "Kuwait" },
  { code: "OM", name: "Oman" },
  { code: "QA", name: "Qatar" },
  { code: "EG", name: "Egypt" },
  { code: "JO", name: "Jordan" },
  { code: "IQ", name: "Iraq" },
  { code: "LB", name: "Lebanon" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
] as const

type Props = {
  defaultValue: string
  onSelect: (countryCode: string, countryName: string) => void
  className?: string
}

export function CountrySelector({ defaultValue, onSelect, className }: Props) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  useEffect(() => {
    if (value !== defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue, value])

  const selected = countries.find(
    (country) => country.code === value || country.name === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal truncate",
            className
          )}
        >
          {value ? selected?.name : "Select country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[225px] p-0 z-[60]"
        align="start"
        portal={true}
      >
        <Command loop>
          <CommandInput
            placeholder="Search country..."
            className="h-9 px-2"
            autoComplete="off"
          />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="overflow-y-auto max-h-[230px] pt-2">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    setValue(country.code)
                    onSelect?.(country.code, country.name)
                    setOpen(false)
                  }}
                >
                  {country.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
