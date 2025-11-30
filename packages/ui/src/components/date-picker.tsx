import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "@elise/icons"

import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type DatePickerProps = { value?: Date; onChange: (date?: Date) => void }

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const isValidDate = value && !isNaN(value.getTime())

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normalborder-border"
          >
            {isValidDate ? value!.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate ? value : undefined}
            captionLayout="dropdown"
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
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

type DateFullRangePickerProps = { value?: Date; onChange: (date?: Date) => void }

export function DateFullRangePicker({ value, onChange }: DateFullRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const isValidDate = value && !isNaN(value.getTime())

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
          >
            {isValidDate ? value!.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
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
type DateRangePickerProps = { value?: DateRangeValue; onChange: (range: DateRangeValue) => void }

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const range: DateRangeValue = value ?? { from: undefined, to: undefined }

  return (
    <div className='w-full space-y-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' id='dates' className='w-full justify-between font-normalborder-border'>
              <div className="flex items-center gap-3">
                <CalendarIcon />
                {range?.from && range?.to
                  ? `${range.from.toLocaleDateString()}-${range.to.toLocaleDateString()}`
                  : 'Pick a date'}
              </div>
              <ChevronDownIcon />
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
