"use client";

import * as React from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons"
import { cn } from "@/libs/utils";
import { format } from "date-fns";

// Define the interface for the props
interface DateTimePicker24hProps {
    formData: {
        start_time: Date | string; // Adjust type based on your needs
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>; // Adjust type based on your needs
}

export function DateTimePicker24h({ formData, setFormData }: DateTimePicker24hProps) {
    const [date, setDate] = React.useState<Date>();
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
            setFormData({ ...formData, start_time: selectedDate });
        }
    };

    const handleTimeChange = (
        type: "hour" | "minute",
        value: string
    ) => {
        if (date) {
            const newDate = new Date(date);
            if (type === "hour") {
                newDate.setHours(parseInt(value));
            } else if (type === "minute") {
                newDate.setMinutes(parseInt(value));
            }
            setDate(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {date ? (
                        format(date, "MM/dd/yyyy hh:mm")
                    ) : (
                        <span>{format(new Date(), "MM/dd/yyyy hh:mm")}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date || new Date()}
                        disabled={date && date < new Date()}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="flex sm:flex-row flex-col sm:divide-x divide-y sm:divide-y-0 sm:h-[300px]">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.reverse().map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={date && date.getHours() === hour ? "default" : "ghost"}
                                        className="sm:w-full aspect-square shrink-0"
                                        onClick={() => handleTimeChange("hour", hour.toString())}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                    <Button
                                        key={minute}
                                        size="icon"
                                        variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                                        className="sm:w-full aspect-square shrink-0"
                                        onClick={() => handleTimeChange("minute", minute.toString())}
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}