import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Represents a feature card's content structure and component props
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
 */
const FeatureCard = ({
    title,
    text,
    image,
    imageAlt,
    className = ""
}: FeatureCardTypes) => (
    <article
        className={`flex flex-col items-start gap-4 bg-white dark:bg-gray-800  shadow-md hover:shadow-lg p-6 rounded-lg text-start ${className}`}
    >
        <h4 className="font-semibold text-gray-900 text-xl dark:text-gray-100 leading-8">{title}</h4>
        <p className="font-normal text-base text-slate-600 dark:text-slate-300 leading-5">{text}</p>
        <Image
            src={image}
            alt={imageAlt}
            width={100}
            height={100}
            className="rounded-lg w-full h-full object-cover"
            loading="lazy"
        />
    </article>
);

/**
 * Features section component displaying feature cards in a grid layout
 */
export const Features = () => {
    const t = useTranslations('landing.features');
    const cards = t.raw('cards') as FeatureCardTypes[];

    return (
        <section
            id="features"
            className="relative bg-gray-50 dark:bg-gray-700 w-full"
            aria-labelledby="features-title"
        >
            <div className="flex flex-col justify-center items-center gap-16 mx-auto px-4 py-16 max-w-7xl container">
                <header className="space-y-4 mx-auto text-center">
                    <h2
                        id="features-title"
                        className="font-medium font-mono text-primary text-sm uppercase leading-5 tracking-wider"
                    >
                        {t("title")}
                    </h2>
                    <h3 className="mx-auto max-w-xs sm:max-w-none font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl dark:text-gray-100">
                        {t("subtitle")}
                    </h3>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-8">
                        {t("description")}
                    </p>
                </header>

                <div className="gap-y-6 lg:gap-x-6 lg:gap-y-0 grid grid-cols-1 lg:grid-cols-3">
                    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:col-span-2">
                        {cards.slice(0, 2).map((card) => (
                            <FeatureCard key={card.title} {...card} />
                        ))}
                        <FeatureCard
                            {...cards[2]}
                            className="lg:col-span-2"
                        />
                    </div>
                    <FeatureCard
                        {...cards[3]}
                        className="lg:row-span-2"
                    />
                </div>
            </div>
        </section>
    );
};