"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Shadcn Accordion components

import type { JSX } from "react";
import Link from "next/link";

// <FAQ> component is a list of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList array below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What do I get exactly?",
    answer: <div className="space-y-2 leading-relaxed">You will receive access to all our courses, materials, and support from our instructors.</div>,
  },
  {
    question: "Can I get a refund?",
    answer: (
      <p>
        Yes! You can request a refund within 7 days of your purchase. Reach out by email for assistance.
      </p>
    ),
  },
  {
    question: "What are the rules of the school?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>1. Respect your instructors and fellow students.</p>
        <p>2. Attend classes regularly and be punctual.</p>
        <p>3. Complete assignments on time.</p>
        <p>4. Maintain a positive and constructive attitude.</p>
      </div>
    ),
  },
  {
    question: "What plans do you offer?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>We offer various plans including monthly and annual subscriptions, with discounts for long-term commitments.</p>
        <p>Check our pricing page for more details.</p>
      </div>
    ),
  },
  {
    question: "I have another question",
    answer: (
      <div className="space-y-2 leading-relaxed">Cool, contact us by email for any inquiries.</div>
    ),
  },
];

const FAQ = () => {
  return (
    <section className="container" id="faq">
      <div className="flex flex-col gap-12 mx-auto py-24 max-w-3xl">
        <div className="flex flex-col text-center basis-1/2">
          <p className="inline-block mb-4 font-semibold text-primary">FAQ</p>
          <p className="font-extrabold text-3xl text-base-content sm:text-4xl">
            Frequently Asked Questions
          </p>
        </div>

        <Accordion type="single" collapsible>
          {faqList.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger >
                {item.question}
              </AccordionTrigger>
              <AccordionContent >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-row justify-center items-center gap-1 basis-1/2">
          <p className="text-base-content/80 text-sm">Still have questions? Email us at </p>
          <Link className="text-base-content text-sm underline" href="mailto:hello@learnwithus.com">hello@learnwithus.com</Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
