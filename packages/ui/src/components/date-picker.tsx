import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "@elise/icons"

import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type DatePickerProps = { value?: Date; onChange: (date?: Date) => void; formatLabel?: (date?: Date) => string }

export function DatePicker({ value, onChange, formatLabel }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const isValidDate = value && !isNaN(value.getTime())
  const label = formatLabel ? formatLabel(value) : isValidDate ? value!.toLocaleDateString() : "Select date"

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal border-border"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon />
              {label}
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate ? value : undefined}
            captionLayout="dropdown"
            disabled={(d) => d < new Date("1900-01-01")}
            onSelect={(d) => {
              onChange(d ?? undefined)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

type DateRangeValue = { from: Date | undefined; to?: Date }
type DateRangePickerProps = {
  value?: DateRangeValue
  onChange: (range: DateRangeValue) => void
  formatLabel?: (range?: DateRangeValue) => string
}

export function DateRangePicker({ value, onChange, formatLabel }: DateRangePickerProps) {
  const range: DateRangeValue = value ?? { from: undefined, to: undefined }
  const label =
    formatLabel?.(range) ??
    (range?.from && range?.to
      ? `${range.from.toLocaleDateString()}-${range.to.toLocaleDateString()}`
      : "Pick a date")

  return (
    <div className='w-full space-y-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' id='dates' className='w-full justify-between font-normal border-border'>
            <div className="flex items-center gap-3">
              <CalendarIcon />
              {label}
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='range'
            selected={range}
            onSelect={range => {
              onChange(range ?? { from: undefined, to: undefined })
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
