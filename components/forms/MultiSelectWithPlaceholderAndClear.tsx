import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/forms/MultiSelector";
import { cn } from "@/libs/utils";

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
    values,
    onChange,
    ariaLabel,
}: MultiSelectWithPlaceholderAndClearProps) {
  return (
    <div className={cn("*:not-first:mt-2", className)}>
      {label && <Label>{label}</Label>}
      <MultipleSelector
        commandProps={{
          label,
        }}
        defaultOptions={options}
        placeholder={placeholder}
        emptyIndicator={emptyIndicator}
        disabled={disabled}
      />
    </div>
  );
}
