"use client";

import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";

interface TimeZoneSelectWithSearchProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
}

export default function TimeZoneSelectWithSearch({
    value,
    onChange,
    disabled = false,
    placeholder = "Select timezone",
    label
}: TimeZoneSelectWithSearchProps) {
    const id = useId();
    const [open, setOpen] = useState<boolean>(false);

    const timezones = Intl.supportedValuesOf("timeZone");

    const formattedTimezones = useMemo(() => {
        return timezones
            .map((timezone) => {
                const formatter = new Intl.DateTimeFormat("en", {
                    timeZone: timezone,
                    timeZoneName: "shortOffset",
                });
                const parts = formatter.formatToParts(new Date());
                const offset = parts.find((part) => part.type === "timeZoneName")?.value || "";
                const modifiedOffset = offset === "GMT" ? "GMT+0" : offset;

                return {
                    value: timezone,
                    label: `(${modifiedOffset}) ${timezone.replace(/_/g, " ")}`,
                    numericOffset: parseInt(offset.replace("GMT", "").replace("+", "") || "0"),
                };
            })
            .sort((a, b) => a.numericOffset - b.numericOffset);
    }, [timezones]);

    return (
        <div className="*:not-first:mt-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="trigger"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value
                                ? formattedTimezones.find((timezone) => timezone.value === value)?.label
                                : placeholder}
                        </span>
                        <ChevronDownIcon
                            size={16}
                            className="text-muted-foreground/80 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border-input w-full min-w-[var(--radix-popper-anchor-width)]"
                    align="start"
                >
                    <Command
                        filter={(value, search) => {
                            const normalizedValue = value.toLowerCase();
                            const normalizedSearch = search.toLowerCase().replace(/\s+/g, "");
                            return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                        }}
                    >
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>No timezone found.</CommandEmpty>
                            <CommandGroup>
                                {formattedTimezones.map(({ value: itemValue, label }) => (
                                    <CommandItem
                                        key={itemValue}
                                        value={itemValue}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        {label}
                                        {value === itemValue && <CheckIcon size={16} className="ml-auto" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
