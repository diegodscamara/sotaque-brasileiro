import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/forms/MultiSelector";
import { cn } from "@/libs/utils";
import { useMemo } from "react";

interface MultiSelectWithPlaceholderAndClearProps {
  options: Option[];
  placeholder: string;
  emptyIndicator?: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  ariaLabel?: string;
}

export default function MultiSelectWithPlaceholderAndClear({
    options,
    placeholder,
    emptyIndicator = "No options found.",
    label,
    className = "",
    disabled = false,
    values = [],
    onChange,
    ariaLabel,
}: MultiSelectWithPlaceholderAndClearProps) {
  // Convert string[] values to Option[] for the MultipleSelector
  const selectedOptions = useMemo(() => 
    values.map(value => options.find(opt => opt.value === value))
      .filter((opt): opt is Option => opt !== undefined),
    [values, options]
  );

  return (
    <div className={cn("*:not-first:mt-2", className)}>
      {label && <Label>{label}</Label>}
      <MultipleSelector
        commandProps={{
          label: ariaLabel || label,
        }}
        defaultOptions={options}
        value={selectedOptions}
        onChange={(selected) => onChange(selected.map(opt => opt.value))}
        placeholder={placeholder}
        emptyIndicator={emptyIndicator}
        disabled={disabled}
      />
    </div>
  );
}
