import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/libs/utils";

interface SelectWithRightIndicatorProps {
    id: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    placeholder: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Select component with right indicator
 * 
 * @param {SelectWithRightIndicatorProps} props - Component props
 * @returns {React.JSX.Element} The select component
 */
export default function SelectWithRightIndicator({
    id,
    value,
    options,
    onChange,
    placeholder,
    label,
    disabled = false,
    className = "",
}: SelectWithRightIndicatorProps): React.JSX.Element {
    return (
        <div className={cn("*:not-first:mt-2", className)}>
            {label && <Label htmlFor={id}>{label}</Label>}
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger id={id}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
