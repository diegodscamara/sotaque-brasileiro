"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JSX, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Star } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

interface TestimonialCard {
    name: string;
    text: string;
    position: string;
    image: string;
    imageAlt: string;
}

/**
 * Testimonials component displays a grid of customer testimonials with scroll-reveal animations.
 * @component
 * @returns {JSX.Element} The Testimonials component
 */
export default function Testimonials(): JSX.Element {
    const t = useTranslations("landing.testimonials");
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "0px 0px -100px 0px" });

    const cards = useMemo(() => {
        const rawCards = t.raw("cards");
        return Array.isArray(rawCards) ? rawCards as TestimonialCard[] : [];
    }, [t]);

    /**
     * Renders a single testimonial card
     * @param {TestimonialCard} card - The testimonial card data
     * @param {number} index - The index of the card in the array
     * @returns {JSX.Element} The testimonial card component
     */
    const renderTestimonialCard = (card: TestimonialCard, index: number): JSX.Element => (
        <motion.article
            key={`${card.name}-${index}`}
            className="flex flex-col gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            aria-labelledby={`testimonial-${index}-title testimonial-${index}-position`}
        >
            <blockquote
                className="font-normal text-gray-700 dark:text-gray-200 text-sm leading-5"
                aria-describedby={`testimonial-${index}-quote`}
            >
                <span id={`testimonial-${index}-quote`}>{card.text}</span>
            </blockquote>
            <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        weight="fill"
                        className="fill-current w-4 h-4 text-yellow-500"
                        aria-hidden="true"
                    />
                ))}
            </div>
            <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                    <AvatarImage
                        src={card.image}
                        alt={card.imageAlt}
                        width={48}
                        height={48}
                        loading="lazy"
                    />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-50">
                        {card.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <h4
                        id={`testimonial-${index}-title`}
                        className="font-semibold text-gray-800 dark:text-gray-50 text-base leading-7"
                    >
                        {card.name}
                    </h4>
                    <p
                        id={`testimonial-${index}-position`}
                        className="font-normal text-gray-600 dark:text-gray-300 text-xs leading-5"
                    >
                        {card.position}
                    </p>
                </div>
            </div>
        </motion.article>
    );

    return (
        <section
            id="testimonials"
            ref={sectionRef}
            className="relative flex flex-col gap-16 mx-auto px-4 py-16 max-w-7xl container"
            aria-labelledby="testimonials-title testimonials-subtitle"
        >
            <header className="flex flex-col gap-4 text-center">
                <h2
                    className="font-mono font-medium text-green-700 dark:text-green-500 text-sm uppercase leading-5 tracking-wider"
                    id="testimonials-title"
                >
                    {t("title")}
                </h2>
                <h3
                    className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl"
                    id="testimonials-subtitle"
                >
                    {t("subtitle")}
                </h3>
            </header>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {cards.map(renderTestimonialCard)}
            </div>
        </section>
    );
}