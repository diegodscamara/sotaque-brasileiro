import { JSX, useRef } from "react";
import { motion, useInView } from "framer-motion";

import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Represents a feature card's content structure and component props
 * @interface
 * @property {string} title - The title of the feature
 * @property {string} text - The description of the feature
 * @property {string} image - The image URL for the feature
 * @property {string} imageAlt - The alt text for the feature image
 * @property {string} [className] - Additional CSS classes
 */
interface FeatureCardTypes {
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    className?: string;
}

/**
 * Individual feature card component with consistent styling and accessibility
 * @component
 * @param {FeatureCardTypes} props - The feature card properties
 * @returns {JSX.Element} The rendered feature card
 */
const FeatureCard = ({
    title,
    text,
    image,
    imageAlt,
    className = ""
}: FeatureCardTypes): JSX.Element => (
    <motion.article
        className={`flex flex-col items-start gap-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-start h-full w-full ${className}`}
        aria-labelledby={`feature-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
    >
        <h4
            id={`feature-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
            className="font-semibold text-gray-800 dark:text-gray-100 text-xl leading-8"
        >
            {title}
        </h4>
        <p className="font-normal text-gray-500 dark:text-gray-400 text-base leading-5">
            {text}
        </p>
        <div className="relative w-full">
            <Image
                src={image}
                alt={imageAlt}
                width={100}
                height={100}
                className="rounded-lg w-full h-full object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    </motion.article>
);

/**
 * Features section component displaying feature cards in a grid layout
 * @component
 * @returns {JSX.Element} The rendered features section
 */
export const Features = (): JSX.Element => {
    const t = useTranslations('landing.features');
    const cards = t.raw('cards') as FeatureCardTypes[];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            id="features"
            className="relative bg-gray-100 dark:bg-gray-700 w-full"
            aria-labelledby="features-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
        >
            <div className="flex flex-col justify-center items-center gap-16 mx-auto px-4 py-16 max-w-7xl container">
                <header className="space-y-4 mx-auto text-center">
                    <motion.h2
                        id="features-title"
                        className="font-mono font-medium text-green-700 dark:text-green-500 text-sm uppercase leading-5 tracking-wider"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.2 }}
                    >
                        {t("title")}
                    </motion.h2>
                    <motion.h3
                        className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4 }}
                    >
                        {t("subtitle")}
                    </motion.h3>
                    <motion.p
                        className="mx-auto max-w-2xl text-gray-600 dark:text-gray-200 text-lg leading-8"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.6 }}
                    >
                        {t("description")}
                    </motion.p>
                </header>

                <div className="gap-y-6 lg:gap-x-6 lg:gap-y-0 grid grid-cols-1 lg:grid-cols-3">
                    <div className="gap-y-6 md:gap-x-6 grid grid-cols-1 sm:grid-cols-2 lg:col-span-2">
                        {cards.slice(0, 2).map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className='col-span-2 md:col-span-1'
                            >
                                <FeatureCard {...card} />
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                            className="col-span-2 lg:col-span-2 lg:row-span-2"
                        >
                            <FeatureCard
                                {...cards[2]}
                                className="lg:col-span-2"
                            />
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6 }}
                        className="col-span-2 lg:col-span-1"
                    >
                        <FeatureCard
                            {...cards[3]}
                            className="lg:row-span-2"
                        />
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};