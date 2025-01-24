"use client"

import React, { JSX } from "react"

import { DatePicker } from "@/components/ui/DatePicker"
import { formatDateTime } from "@/libs/utils/dateUtils";
import { z } from "zod";

const dateSchema = z.date().refine(date => date >= new Date(), {
    message: "Date must be in the future",
});

/**
 * Validates and sanitizes the date input.
 * @param {Date | null} date - The date to validate.
 * @returns {Date | null} - The validated date or null if invalid.
 */
const validateAndSanitizeDate = (date: Date | null): Date | null => {
    if (date && dateSchema.safeParse(date).success) {
        return date;
    }
    return null;
}

interface DatePickerTimeExampleProps {
    value: Date | null;
    setValue: (value: Date | null) => void;
}

/**
 * DatePickerTimeExample component for selecting a date and time.
 * @param {DatePickerTimeExampleProps} props - The component props.
 * @returns {JSX.Element} - The rendered component.
 */
export const DatePickerTimeExample = ({ value, setValue }: DatePickerTimeExampleProps): JSX.Element => {
    const presets = React.useMemo(() => [
        { label: "Today", date: new Date() },
        { label: "Tomorrow", date: new Date(new Date().setDate(new Date().getDate() + 1)) },
        { label: "A week from now", date: new Date(new Date().setDate(new Date().getDate() + 7)) },
        { label: "A month from now", date: new Date(new Date().setMonth(new Date().getMonth() + 1)) }
    ], []);

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
                        onChange={(date) => {
                            const sanitizedDate = validateAndSanitizeDate(date);
                            setValue(sanitizedDate);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}