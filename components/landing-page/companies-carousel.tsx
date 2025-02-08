"use client"

import { useEffect, useRef, useState } from "react";

import Image from "next/image"
import Marquee from "@/components/ui/marquee"
import { useTranslations } from "next-intl";

interface CompanyLogo {
  name: string;
  src: string;
  alt: string;
}

export function CompaniesCarousel() {
    const t = useTranslations('landing.companies');
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const currentRef = sectionRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <section 
            id="companies" 
            ref={sectionRef}
            className="relative flex flex-col items-center gap-8 mx-auto px-4 py-16 max-w-7xl container"
        >
            <h2 className="font-medium font-mono text-center text-primary text-sm uppercase tracking-wider">
                {t('title')}
            </h2>
            <div className={`relative w-full overflow-hidden ${isVisible ? "animate-slide" : ""}`}>
                <Marquee>
                    {(t.raw('logos') as unknown as CompanyLogo[]).map((logo: CompanyLogo, index: number) => (
                        <div key={index} className="flex-shrink-0 opacity-90 hover:opacity-100 dark:opacity-95 transition-opacity duration-300">
                            <Image
                                src={logo.src || "/placeholder.svg"}
                                alt={logo.alt}
                                className={'h-10 w-28 dark:brightness-0 dark:invert grayscale opacity-30 hover:opacity-100 transition-opacity duration-300'}
                                width={112}
                                height={40}
                            />
                        </div>
                    ))}
                </Marquee>
                <div className="left-0 absolute inset-y-0 bg-gradient-to-r from-gray-50 dark:from-gray-800 w-1/3 h-full pointer-events-none"></div>
                <div className="right-0 absolute inset-y-0 bg-gradient-to-l from-gray-50 dark:from-gray-800 w-1/3 h-full pointer-events-none"></div>
            </div>
        </section>
    )
}

