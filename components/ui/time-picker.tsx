"use client"

import * as React from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Clock } from 'lucide-react'
import { cn } from "@/libs/utils"

export function TimePicker({
  selectedTime,
  onSelect,
}: {
  selectedTime: string;
  onSelect: (time: string) => void;
}) {
  const [time, setTime] = React.useState<{ hour: string; minute: string; period: string }>({ 
    hour: "", 
    minute: "", 
    period: ""
  })

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  const periods = ["AM", "PM"]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full sm:w-[240px] justify-start text-left font-normal",
            !time.hour && !time.minute && !time.period && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 w-4 h-4" />
          {time.hour && time.minute && time.period 
            ? `${time.hour}:${time.minute} ${time.period}` 
            : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full sm:w-auto" align="start">
        <div className="flex sm:flex-row flex-col sm:space-x-2 space-y-2 sm:space-y-0 p-4">
          <Select
            onValueChange={(value) => setTime(prev => ({ ...prev, hour: value }))}
          >
            <SelectTrigger className="w-full sm:w-[70px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setTime(prev => ({ ...prev, minute: value }))}
          >
            <SelectTrigger className="w-full sm:w-[70px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setTime(prev => ({ ...prev, period: value }))}
          >
            <SelectTrigger className="w-full sm:w-[70px]">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

