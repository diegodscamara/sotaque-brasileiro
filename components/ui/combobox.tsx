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
// @ts-ignore
import { CircleFlag } from 'react-circle-flags';

interface ComboboxProps {
  options: { code: string; name: string }[];
  value: string;
  onChange: (value: string, option?: { code: string; name: string }) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  useNameAsValue?: boolean;
  showFlags?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  className,
  useNameAsValue = true,
  showFlags = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter options based on the search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter((option) => {
      // Search by name (case insensitive)
      const nameMatch = option.name.toLowerCase().includes(lowerSearchTerm);
      // Search by code (case insensitive)
      const codeMatch = option.code.toLowerCase().includes(lowerSearchTerm);

      return nameMatch || codeMatch;
    });
  }, [options, searchTerm]);

  // Find the selected option based on value
  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    return options.find((option) =>
      useNameAsValue
        ? option.name === value
        : option.code === value
    );
  }, [options, value, useNameAsValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          className={cn("justify-between w-full bg-transparent hover:bg-gray-100 hover:text-gray-800 dark:bg-transparent hover:dark:bg-gray-800", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {showFlags && selectedOption && (
              <CircleFlag
                countryCode={selectedOption.code.toLowerCase()}
                height={16}
                width={16}
                className="rounded-full"
                aria-hidden="true"
              />
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.name : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput
            placeholder="Search by name or code..."
            value={searchTerm}
            onValueChange={(term) => setSearchTerm(term)} // Update search term
          />
          <CommandList>
            {filteredOptions.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.code}
                    value={option.name} // Use name for search matching
                    onSelect={() => {
                      const valueToUse = useNameAsValue ? option.name : option.code;
                      onChange(valueToUse, option);
                      setOpen(false);
                      setSearchTerm(""); // Clear search term after selection
                    }}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOption?.code === option.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {showFlags && (
                      <CircleFlag
                        countryCode={option.code.toLowerCase()}
                        height={16}
                        width={16}
                        className="rounded-full"
                        aria-hidden="true"
                      />
                    )}
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
