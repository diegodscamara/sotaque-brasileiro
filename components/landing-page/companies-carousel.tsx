"use client"

import { JSX, useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image"
import Marquee from "@/components/ui/marquee"
import { useTranslations } from "next-intl";

interface CompanyLogo {
    name: string;
    src: string;
    alt: string;
}

/**
 * CompaniesCarousel component displays a marquee of company logos
 * @returns {JSX.Element} - Section containing animated company logos
 */
export function CompaniesCarousel(): JSX.Element {
    const t = useTranslations('landing.companies');
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        const currentRef = sectionRef.current;
        const observer = new IntersectionObserver(handleIntersection, { threshold: 0.1 });

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [handleIntersection]);

    const companyLogos = t.raw('logos') as unknown as CompanyLogo[];

    const renderLogo = useCallback((logo: CompanyLogo, index: number) => (
        <div 
            key={index} 
            className="flex-shrink-0 opacity-90 hover:opacity-100 dark:opacity-95 transition-opacity duration-300"
            role="img"
            aria-label={logo.alt}
        >
            <Image
                src={logo.src || "/placeholder.svg"}
                alt={logo.alt}
                className="dark:brightness-0 opacity-30 hover:opacity-100 w-28 h-10 dark:invert transition-opacity duration-300 grayscale"
                width={112}
                height={40}
                priority={index < 5} // Prioritize first 5 logos for better LCP
            />
        </div>
    ), []);

    return (
        <section
            id="companies"
            ref={sectionRef}
            className="relative flex flex-col items-center gap-8 mx-auto px-4 py-16 max-w-7xl container"
            aria-labelledby="companies-title"
        >
            <h2
                id="companies-title"
                className="font-medium font-mono text-center text-primary text-sm uppercase tracking-wider"
            >
                {t('title')}
            </h2>
            <div className={`relative w-full overflow-hidden ${isVisible ? "animate-slide" : ""}`}>
                <Marquee>
                    {companyLogos.map(renderLogo)}
                </Marquee>
                <div 
                    className="left-0 absolute inset-y-0 bg-gradient-to-r from-gray-50 dark:from-gray-800 w-1/3 h-full pointer-events-none"
                    aria-hidden="true"
                />
                <div 
                    className="right-0 absolute inset-y-0 bg-gradient-to-l from-gray-50 dark:from-gray-800 w-1/3 h-full pointer-events-none"
                    aria-hidden="true"
                />
            </div>
        </section>
    )
}

