import { motion } from "framer-motion";

interface FormSectionProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

/**
 * Form section component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 * @returns {React.JSX.Element} A styled form section
 */
export default function FormSection({
    children,
    title,
    subtitle
}: FormSectionProps): React.JSX.Element {
    return (
        <motion.div
            className="mb-10 last:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="mb-6">
                <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-50 text-xl leading-tight">{title}</h2>
                <p className="font-normal text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{subtitle}</p>
            </div>

            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );
}