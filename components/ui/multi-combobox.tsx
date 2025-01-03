"use client";

import * as React from "react";

import { CaretDown, Check } from "@phosphor-icons/react";

interface MultiComboboxProps {
  options: { id: string; name: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiCombobox({ options, values, onChange, placeholder = "Select..." }: MultiComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);

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

  const selectedOptions = options.filter(option => values.includes(option.id));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="select select-bordered w-full text-left flex items-center justify-between"
      >
        <span className="block truncate">
          {selectedOptions.length > 0 
            ? selectedOptions.map(o => o.name).join(", ")
            : placeholder}
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
                  key={option.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-base-200 flex items-center justify-between ${
                    values.includes(option.id) ? 'bg-base-200' : ''
                  }`}
                  onClick={() => {
                    const newValues = values.includes(option.id)
                      ? values.filter(v => v !== option.id)
                      : [...values, option.id];
                    onChange(newValues);
                  }}
                >
                  {option.name}
                  {values.includes(option.id) && (
                    <Check 
                      className="mr-2 h-4 w-4" 
                      weight={values.includes(option.id) ? "fill" : "regular"} 
                    />
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