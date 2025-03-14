import { Label } from "@/components/ui/label";
import RequiredFieldIndicator from "./RequiredFieldIndicator";
import FieldHelp from "./FieldHelp";
import Error from "./Error";

interface FormFieldProps {
    children: React.ReactNode;
    label?: string;
    id: string;
    error?: string;
    required?: boolean;
    helpText?: string;
}

/**
 * Form field component with error handling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Field content
 * @param {string} props.label - Field label
 * @param {string} props.id - Field ID
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.helpText - Optional help text
 * @returns {React.JSX.Element} A styled form field with label and error handling
 */
export default function FormField({
    children,
    label,
    id,
    error,
    required = false,
    helpText
}: FormFieldProps): React.JSX.Element {
    return (
        <div className="space-y-2">
            <div className="flex items-center">
                <Label
                    htmlFor={id}
                    className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm leading-none"
                >
                    {label}
                    {required && <RequiredFieldIndicator label={label ?? ""} />}
                    {helpText && <FieldHelp content={helpText} />}
                </Label>
            </div>
            {children}
            <Error error={error ?? ""} id={id} />
        </div>
    );
}