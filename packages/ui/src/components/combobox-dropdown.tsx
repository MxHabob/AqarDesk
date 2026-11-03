"use client"

import { cn } from "cn"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export type ComboboxItem = {
  id: string
  label: string
  disabled?: boolean
}

type Props<T> = {
  placeholder?: React.ReactNode
  searchPlaceholder?: string
  items: T[]
  onSelect: (item: T) => void
  selectedItem?: T
  renderSelectedItem?: (selectedItem: T) => React.ReactNode
  renderOnCreate?: (value: string) => React.ReactNode
  renderListItem?: (listItem: {
    isChecked: boolean
    item: T
  }) => React.ReactNode
  emptyResults?: React.ReactNode
  popoverProps?: React.ComponentProps<typeof PopoverContent>
  disabled?: boolean
  onCreate?: (value: string) => void
  headless?: boolean
  className?: string
  triggerClassName?: string
  listClassName?: string
  modal?: boolean
}

export function ComboboxDropdown<T extends ComboboxItem>({
  headless,
  placeholder,
  searchPlaceholder,
  items,
  onSelect,
  selectedItem: incomingSelectedItem,
  renderSelectedItem = (item) => item.label,
  renderListItem,
  renderOnCreate,
  emptyResults,
  popoverProps,
  disabled,
  onCreate,
  className,
  triggerClassName,
  listClassName,
  modal = true,
}: Props<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalSelectedItem, setInternalSelectedItem] = React.useState<
    T | undefined
  >()
  const [inputValue, setInputValue] = React.useState("")

  const selectedItem = incomingSelectedItem ?? internalSelectedItem
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase())
  )
  const showCreate = onCreate && Boolean(inputValue) && !filteredItems.length

  const component = (
    <Command loop shouldFilter={false}>
      <CommandInput
        value={inputValue}
        onValueChange={setInputValue}
        placeholder={searchPlaceholder ?? "Search item..."}
        className="px-3"
      />

      <CommandGroup>
        <CommandList
          className={cn("max-h-[225px] overflow-auto", listClassName)}
        >
          {filteredItems.map((item) => {
            const isChecked = selectedItem?.id === item.id

            return (
              <CommandItem
                disabled={item.disabled}
                className={cn("cursor-pointer", className)}
                key={item.id}
                value={item.id}
                onSelect={(id) => {
                  const foundItem = items.find((item) => item.id === id)

                  if (!foundItem) {
                    return
                  }

                  onSelect(foundItem)
                  setInternalSelectedItem(foundItem)
                  setOpen(false)
                }}
              >
                {renderListItem ? (
                  renderListItem({ isChecked, item })
                ) : (
                  <>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isChecked ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </>
                )}
              </CommandItem>
            )
          })}

          <CommandEmpty>{emptyResults ?? "No item found"}</CommandEmpty>

          {showCreate && (
            <CommandItem
              key={inputValue}
              value={inputValue}
              onSelect={() => {
                onCreate(inputValue)
                setOpen(false)
                setInputValue("")
              }}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              {renderOnCreate ? renderOnCreate(inputValue) : null}
            </CommandItem>
          )}
        </CommandList>
      </CommandGroup>
    </Command>
  )

  if (headless) {
    return component
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger
        disabled={disabled}
        className="w-full"
        render={
          <Button
            variant="outline"
            aria-expanded={open}
            className={cn(
              "relative w-full justify-between font-normal",
              triggerClassName
            )}
          />
        }
      >
        <span className="truncate pr-3 text-ellipsis">
          {selectedItem ? (
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {renderSelectedItem(selectedItem)}
            </span>
          ) : (
            (placeholder ?? "Select item...")
          )}
        </span>
        <ChevronsUpDown className="absolute right-2 size-4 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        {...popoverProps}
        className={cn("p-0", popoverProps?.className)}
        style={{
          width: "var(--anchor-width)",
          ...popoverProps?.style,
        }}
      >
        {component}
      </PopoverContent>
    </Popover>
  )
}
