"use client"

import { DatePicker } from "@/components/ui/DatePicker"
import React from "react"
import { formatDateTime } from "@/libs/utils/dateUtils";

interface DatePickerTimeExampleProps {
    value: Date | null;
    setValue: (value: Date | null) => void;
}

export const DatePickerTimeExample = ({ value, setValue }: DatePickerTimeExampleProps) => {
    const presets = [
        {
            label: "Today",
            date: new Date(),
        },
        {
            label: "Tomorrow",
            date: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
        {
            label: "A week from now",
            date: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
        {
            label: "A month from now",
            date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
    ];

    return (
        <div>
            <div className="flex flex-col gap-2 mx-auto">
                <p className="text-sm">
                    {value ? formatDateTime(value) : "Select a date and time for the class"}
                </p>
                <div className="flex flex-row gap-2">
                    <DatePicker
                        presets={presets}
                        placeholder="Select a date and time"
                        showTimePicker
                        value={value}
                        fromDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                        onChange={(value) => {
                            setValue(value || null);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}