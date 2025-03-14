import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Required field indicator component with tooltip
 * 
 * @returns {React.JSX.Element} A red asterisk for required fields with tooltip
 */
export default function RequiredFieldIndicator({ label }: { label: string }): React.JSX.Element {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className="inline-flex ml-1 text-red-500" aria-hidden="true">*</span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};