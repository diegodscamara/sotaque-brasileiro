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
        className="flex justify-between items-center w-full text-left select-bordered select-primary select-sm select"
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.name : placeholder}
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
                    <Check className="mr-2 rounded-full w-6 h-6 text-primary" weight="fill" />
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