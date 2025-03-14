import { AnimatePresence } from "framer-motion";

interface ErrorProps {
    error: string;
    id: string;
}

/**
 * Error component
 * 
 * @param {ErrorProps} props - The error props
 * @returns {React.JSX.Element} The error component
 */
export default function Error({ error, id }: ErrorProps): React.JSX.Element {
    return (
        <AnimatePresence>
            {error && (
                <div
                    id={`${id}-error`}
                    role="alert"
                    className="font-medium text-red-500 text-xs"
                >
                    {error}
                </div>
            )}
        </AnimatePresence>
    );
}