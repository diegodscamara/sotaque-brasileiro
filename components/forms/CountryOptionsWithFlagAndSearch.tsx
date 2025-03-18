"use client";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";
import { CircleFlag } from "react-circle-flags";

interface CountryOptionsWithFlagAndSearchProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    options: { label: string; value: string }[];
}

export default function CountryOptionsWithFlagAndSearch({
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "Select country",
    label
}: CountryOptionsWithFlagAndSearchProps) {
    const id = useId();
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className="*:not-first:mt-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="trigger"
                        id={id}
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                    >
                        {value ? (
                            <span className="flex items-center gap-2 min-w-0">
                                <span className="text-lg leading-none">
                                    <CircleFlag
                                        countryCode={options.find((option) => option.label === value)?.value.toLowerCase() ?? ""}
                                        height={16}
                                        width={16}
                                        className="ml-auto"
                                    />
                                </span>
                                <span className="truncate">{value}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">Select country</span>
                        )}
                        <ChevronDownIcon
                            size={16}
                            className="text-muted-foreground/80 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border-input w-full min-w-[var(--radix-popover-trigger-width)]"
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            {options.sort((a, b) => a.label.localeCompare(b.label)).map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <CircleFlag
                                        countryCode={option.value.toLowerCase()}
                                        height={16}
                                        width={16}
                                    />
                                    {option.label}

                                </CommandItem>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
