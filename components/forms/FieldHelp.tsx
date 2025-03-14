import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "@phosphor-icons/react";

/**
 * Field help tooltip component
 * 
 * @param {string} content - The tooltip content
 * @returns {React.JSX.Element} An info icon with tooltip
 */
export default function FieldHelp({ content }: { content: string }): React.JSX.Element {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center ml-1.5 text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400 transition-colors">
                        <Info size={14} weight="fill" aria-hidden="true" />
                    </span>
                </TooltipTrigger>
                <TooltipContent className="bg-green-600 dark:bg-green-500 text-gray-200 dark:text-gray-800">
                    <p className="text-xs">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};