"use client";

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
import { useId, useState } from "react";
import { cn } from "@/libs/utils";

interface SelectWithSearchProps {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    nonFoundMessage?: string;
    disabled?: boolean;
    className?: string;
}

export default function SelectWithSearch({
    options,
    value,
    onChange,
    label,
    placeholder = "Select option",
    nonFoundMessage = "No options found.",
    disabled = false,
    className = "",
}: SelectWithSearchProps) {
    const id = useId();
    const [open, setOpen] = useState<boolean>(false);


    return (
        <div className={cn("*:not-first:mt-2", className)}>
            <Label htmlFor={id}>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        role="combobox"
                        aria-expanded={open}
                        variant="trigger"
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value
                                ? options.find((option) => option.value === value)?.label
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
                    className={cn("p-0 border-input w-full min-w-[var(--radix-popper-anchor-width)]", disabled && "opacity-50")}
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>{nonFoundMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        {option.label}
                                        {value === option.value && <CheckIcon size={16} className="ml-auto" />}
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
