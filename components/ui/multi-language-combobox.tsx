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
import { Check, X } from "@phosphor-icons/react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { Badge } from "@/components/ui/badge";

interface MultiLanguageComboboxProps {
  languages: { id: string; name: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export function MultiLanguageCombobox({
  languages,
  values,
  onChange,
  placeholder = "Select languages...",
  className,
  emptyMessage = "No languages found.",
  searchPlaceholder = "Search languages..."
}: MultiLanguageComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter languages based on the search term
  const filteredLanguages = React.useMemo(() => {
    if (!searchTerm) return languages;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return languages.filter((language) =>
      language.name.toLowerCase().includes(lowerSearchTerm) || 
      language.id.toLowerCase().includes(lowerSearchTerm)
    );
  }, [languages, searchTerm]);

  // Find the selected languages
  const selectedLanguages = React.useMemo(() => {
    return languages.filter((language) => values.includes(language.id));
  }, [languages, values]);

  // Toggle a language selection
  const toggleLanguage = (languageId: string) => {
    if (values.includes(languageId)) {
      onChange(values.filter(id => id !== languageId));
    } else {
      onChange([...values, languageId]);
    }
  };

  // Remove a language from selection
  const removeLanguage = (e: React.MouseEvent, languageId: string) => {
    e.stopPropagation();
    onChange(values.filter(id => id !== languageId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-popover hover:bg-popover dark:hover:bg-popover border-gray-300 focus:border-green-700 dark:focus:border-green-500 dark:border-gray-500 focus:ring-0 focus:ring-offset-0 min-h-10",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {selectedLanguages.length > 0 ? (
              selectedLanguages.map(language => (
                <Badge 
                  key={language.id} 
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {language.name}
                  <button
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1"
                    onClick={(e) => removeLanguage(e, language.id)}
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove {language.name}</span>
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder || "Search languages by name..."} 
            onValueChange={setSearchTerm}
            className="border-none focus:ring-0"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredLanguages.map((language) => (
              <CommandItem
                key={language.id}
                value={`${language.id} ${language.name}`}
                onSelect={() => toggleLanguage(language.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.includes(language.id) ? "opacity-100" : "opacity-0"
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