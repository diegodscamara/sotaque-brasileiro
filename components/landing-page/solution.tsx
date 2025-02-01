import Image from "next/image";
import { useTranslations } from "next-intl";

type Card = {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

export const Features = () => {
    const t = useTranslations('landing.features');
    const cards = t.raw('cards') as Card[];

    return (
        <section id="features" className="relative bg-gray-50 w-full">
            <div className="flex flex-col justify-center items-center gap-16 mx-auto px-4 py-16 max-w-7xl container">
                <div className="space-y-4 mx-auto text-center">
                    <h2 className="font-medium font-mono text-primary text-sm uppercase leading-5 tracking-wider">{t("title")}</h2>
                    <h3 className="mx-auto max-w-xs sm:max-w-none font-extrabold text-3xl sm:text-4xl md:text-5xl">{t("subtitle")}</h3>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-8">{t("description")}</p>
                </div>
                <div className="gap-y-6 lg:gap-x-6 lg:gap-y-0 grid grid-cols-1 lg:grid-cols-3">
                    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:col-span-2">
                        {cards.slice(0, 2).map((card) => (
                            <div key={card.title} className="flex flex-col items-start gap-4 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg p-6 rounded-lg text-start transition-all duration-300">
                                <h4 className="font-semibold text-xl leading-8">{card.title}</h4>
                                <p className="font-normal text-base text-slate-600 leading-5">{card.text}</p>
                                <Image src={card.image} alt={card.imageAlt} width={100} height={100} className="rounded-lg w-full h-full object-cover" />
                            </div>
                        ))}
                        <div className="flex flex-col items-start gap-4 lg:col-span-2 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg p-6 rounded-lg text-start transition-all duration-300">
                            <h4 className="font-semibold text-xl leading-8">{cards[2].title}</h4>
                            <p className="font-normal text-base text-slate-600 leading-5">{cards[2].text}</p>
                            <Image src={cards[2].image} alt={cards[2].imageAlt} width={100} height={100} className="rounded-lg w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4 lg:row-span-2 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg p-6 rounded-lg text-start transition-all duration-300">
                        <h4 className="font-semibold text-xl leading-8">{cards[3].title}</h4>
                        <p className="font-normal text-base text-slate-600 leading-5">{cards[3].text}</p>
                        <Image src={cards[3].image} alt={cards[3].imageAlt} width={100} height={100} className="rounded-lg w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </section>
    )
}