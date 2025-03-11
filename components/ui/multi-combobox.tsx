/* eslint-disable no-unused-vars */
"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Check } from "@phosphor-icons/react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";

interface MultiComboboxProps {
  options: { id: string; name: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function MultiCombobox({ options, values, onChange, placeholder = "Select...", ariaLabel }: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOptions = options.filter(option => values.includes(option.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          className="justify-between bg-popover border-gray-300 focus:border-green-700 dark:focus:border-green-500 dark:border-gray-500 focus:ring-0 focus:ring-offset-0 w-full h-10 truncate text-wrap whitespace-break-spaces"
        >
          {selectedOptions.length > 0
            ? selectedOptions.map(o => o.name).join(", ")
            : placeholder}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full max-h-96 overflow-y-auto">
        <Command>
          <CommandInput className="bg-popover border-gray-300 focus:border-green-700 dark:focus:border-green-500 dark:border-gray-500 focus:ring-0 focus:ring-offset-0 text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 text-sm leading-none" placeholder="Search..." value={searchTerm} onValueChange={setSearchTerm} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={(currentValue) => {
                    const newValues = values.includes(currentValue)
                      ? values.filter(v => v !== currentValue)
                      : [...values, currentValue];
                    onChange(newValues);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(option.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}