"use client";

import * as React from "react";

import { CaretDown, Check } from "@phosphor-icons/react";

interface ComboboxProps {
  options: { code: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({ options, value, onChange, placeholder = "Select..." }: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(option => option.code === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="select select-bordered w-full text-left flex items-center justify-between"
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className="pointer-events-none">
          <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-base-100 shadow-lg border border-base-300">
          <div className="p-2">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results found</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.code}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-base-200 flex items-center justify-between ${
                    value === option.code ? 'bg-base-200' : ''
                  }`}
                  onClick={() => {
                    onChange(option.code);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  {option.name}
                  {value === option.code && (
                    <Check className="mr-2 h-4 w-4" weight="fill" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 