"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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

interface LanguageComboboxProps {
  languages: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LanguageCombobox({
  languages,
  value,
  onChange,
  placeholder = "Select language...",
  className,
}: LanguageComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter languages based on the search term
  const filteredLanguages = React.useMemo(() => {
    if (!searchTerm) return languages;

    return languages.filter((language) =>
      language.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [languages, searchTerm]);

  // Find the selected language
  const selectedLanguage = React.useMemo(() => {
    return languages.find((language) => language.id === value);
  }, [languages, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-popover hover:bg-transparent dark:hover:bg-transparent border-gray-300 focus:border-green-700 dark:focus:border-green-500 dark:border-gray-500 focus:ring-0 focus:ring-offset-0",
            className
          )}
        >
          {selectedLanguage ? selectedLanguage.name : placeholder}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput
            placeholder="Search languages by name..."
            onValueChange={setSearchTerm}
            className="border-none focus:ring-0"
          />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredLanguages.map((language) => (
              <CommandItem
                key={language.id}
                value={`${language.id} ${language.name}`}
                onSelect={() => {
                  onChange(language.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {language.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 