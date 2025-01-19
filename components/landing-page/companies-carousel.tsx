"use client"

import Image from "next/image"
import Marquee from "@/components/ui/marquee"

const LOGOS = [
    {
        src: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        alt: "Google",
        className: "w-28 h-10",
    },
    {
        src: "https://www.microsoft.com/en-us/p/microsoft-edge/9wzdncrfj3t8?activetab=pivot:overviewtab",
        alt: "Microsoft",
        className: "w-28 h-10",
    },
    {
        src: "https://www.apple.com/ac/structured-data/images/open_graph_logo.png",
        alt: "Apple",
        className: "w-28 h-10",
    },
    {
        src: "https://www.amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg",
        alt: "Amazon",
        className: "w-28 h-10",
    },
    {
        src: "https://www.facebook.com/images/fb_icon_325x325.png",
        alt: "Facebook",
        className: "w-28 h-10",
    },
    {
        src: "https://www.netflix.com/favicon.ico",
        alt: "Netflix",
        className: "w-28 h-10",
    },
    {
        src: "https://www.tesla.com/tesla_theme/assets/img/meta-logo.png",
        alt: "Tesla",
        className: "w-28 h-10",
    },
]

export function CompaniesCarousel() {
    return (
        <section className="bg-background py-14 w-full overflow-hidden">
            <div className="mx-auto px-4 md:px-8 container">
                <h2 className="font-semibold text-center text-gray-500 text-sm">HELPED PEOPLE FROM COMPANIES LIKE</h2>
                <div className="relative mt-6 w-full overflow-hidden">
                    <Marquee pauseOnHover>
                        {LOGOS.map((logo, index) => (
                            <div key={index} className="flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity duration-300">
                                <Image
                                    src={logo.src || "/placeholder.svg"}
                                    alt={logo.alt}
                                    className={logo.className}
                                    width={200}
                                    height={80}
                                />
                            </div>
                        ))}
                    </Marquee>
                    <div className="left-0 absolute inset-y-0 bg-gradient-to-r from-white dark:from-black w-1/3 h-full pointer-events-none"></div>
                    <div className="right-0 absolute inset-y-0 bg-gradient-to-l from-white dark:from-black w-1/3 h-full pointer-events-none"></div>
                </div>
            </div>
        </section>
    )
}

