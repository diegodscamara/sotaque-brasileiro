"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";

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
 */
export default function Testimonials() {
    const t = useTranslations("landing.testimonials");
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "0px 0px -100px 0px" });

    // Memoize the cards data to prevent unnecessary re-renders
    const cards = useMemo(() => t.raw("cards") as TestimonialCard[], [t]);

    return (
        <section
            id="testimonials"
            ref={sectionRef}
            className="relative flex flex-col gap-16 mx-auto px-4 py-16 max-w-7xl container"
            aria-labelledby="testimonials-title"
        >
            <header className="flex flex-col gap-4 text-center">
                <h2
                    className="font-medium font-mono text-primary text-sm uppercase leading-5 tracking-wider"
                    id="testimonials-title"
                >
                    {t("title")}
                </h2>
                <h3
                    className="mx-auto max-w-xs sm:max-w-none font-extrabold text-3xl text-gray-800 sm:text-4xl md:text-5xl dark:text-gray-100"
                    id="testimonials-subtitle"
                >
                    {t("subtitle")}
                </h3>
            </header>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, index) => (
                    <motion.article
                        key={`${card.name}-${index}`}
                        className="flex flex-col gap-4 border-gray-300 dark:border-gray-600 p-4 border rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        aria-labelledby={`testimonial-${index}-title`}
                    >
                        <blockquote className="font-normal text-gray-700 text-sm dark:text-gray-300 leading-5">
                            {card.text}
                        </blockquote>
                        <div className="flex gap-1" aria-hidden="true">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    weight="fill"
                                    className="w-4 h-4 text-yellow-500 fill-current"
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
                                />
                                <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100">
                                    {card.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <h4
                                    id={`testimonial-${index}-title`}
                                    className="font-semibold text-base text-gray-800 dark:text-gray-100 leading-7"
                                >
                                    {card.name}
                                </h4>
                                <p className="font-normal text-gray-600 text-xs dark:text-gray-400 leading-5">
                                    {card.position}
                                </p>
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}