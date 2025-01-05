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
        className="flex justify-between items-center w-full text-left select-bordered select-primary select-sm select"
      >
        <span className="block truncate">
          {selectedOptions.length > 0 
            ? selectedOptions.map(o => o.name).join(", ")
            : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="z-10 absolute bg-base-100 shadow-lg mt-1 border border-base-300 rounded-md w-full">
          <div className="p-2">
            <input
              type="text"
              className="input-bordered w-full input input-primary input-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="py-1 max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-sm">No results found</li>
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
                      className="mr-2 rounded-full w-6 h-6 text-primary" 
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