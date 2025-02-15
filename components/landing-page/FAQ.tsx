"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Shadcn Accordion components

import type { JSX } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslations } from "next-intl";

// <FAQ> component is a list of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList array below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

/**
 * FAQ component displays frequently asked questions in an accessible accordion format.
 * @returns {JSX.Element} - Rendered FAQ section with interactive accordion
 */
const FAQ = (): JSX.Element => {
  const t = useTranslations('landing.faq'); // Initialize translation hook

  // Fetch FAQ questions from JSON using t.raw
  const faqList: FAQItemProps[] = Object.values(t.raw('questions')).map((value) => ({
    question: (value as { question: string }).question,
    answer: <div className="space-y-2 leading-relaxed">{(value as { answer: string }).answer}</div>,
  }));

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col gap-16 mx-auto px-4 py-16 max-w-7xl container"
      id="faq"
      aria-labelledby="faq-title"
    >
      <header className="flex flex-col gap-4 text-center">
        <h2 id="faq-title" className="font-mono font-medium text-green-700 dark:text-green-500 text-sm uppercase leading-5 tracking-wider">
          {t('title')}
        </h2>
        <h3 className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl">
          {t('subtitle')}
        </h3>
      </header>

      {/* Render the FAQ list using Shadcn Accordion component */}
      <Accordion type="single" collapsible className="mx-auto w-full max-w-4xl">
        {faqList.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="font-semibold text-gray-800 hover:text-green-700 dark:hover:text-green-500 dark:text-gray-100 text-base leading-6 duration-300 ease-in-out">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 dark:text-gray-200 text-sm leading-5 duration-300 ease-in-out">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex flex-row flex-wrap justify-center items-center gap-1">
        <p className="font-normal text-gray-600 dark:text-gray-200 text-sm leading-5 duration-300 ease-in-out">
          {t('disclaimer')}
        </p>
        <Link
          className="font-normal text-gray-600 hover:text-green-700 dark:hover:text-green-500 dark:text-gray-200 text-sm underline leading-5 duration-300 ease-in-out"
          href={`mailto:${t('email')}`}
          aria-label="Contact us via email"
        >
          {t('email')}
        </Link>
      </div>
    </motion.section>
  );
};

export default FAQ;
