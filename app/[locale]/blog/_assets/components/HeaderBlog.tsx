"use client";

import { Popover, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";

import ButtonSignin from "@/components/ButtonSignin";
import Image from "next/image";
import type { JSX } from "react";
import Link from "next/link";
import { categories } from "../content";
import config from "@/config";
import logo from "@/app/icon.png";
import { useSearchParams } from "next/navigation";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/blog/",
    label: "All Posts",
  },
];

const cta: JSX.Element = (
  <ButtonSignin text="Prevent disputes" extraStyle="btn-primary md:btn-sm" />
);

const ButtonPopoverCategories = () => {
  return (
    <Popover className="relative z-30">
      {({ open }) => (
        <>
          <Popover.Button
            className="flex flex-nowrap items-center gap-1 text-base-content/80 hover:text-base-content focus:text-base-content active:text-base-content no-underline duration-100 link"
            title="Open Blog categories"
          >
            Categories
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-5 h-5 duration-200 ${
                open ? "transform rotate-180 " : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Popover.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="left-0 z-30 absolute mt-3 w-screen max-w-full sm:max-w-sm transform">
              {({ close }) => (
                <div className="ring-opacity-5 shadow-lg rounded-box ring-1 ring-base-content overflow-hidden">
                  <div className="relative gap-2 grid bg-base-100 p-2 overflow-hidden">
                    {categories.map((category) => (
                      <div key={category.slug} onClick={() => close()}>
                        <Link
                          className="block hover:bg-base-200 -m-1 p-3 rounded-box text-left duration-200 cursor-pointer"
                          href={`/blog/category/${category.slug}`}
                        >
                          <div className="">
                            <p className="mb-0.5 font-medium">
                              {category?.titleShort || category.title}
                            </p>
                            <p className="opacity-80 text-sm">
                              {category?.descriptionShort ||
                                category.description}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

const ButtonAccordionCategories = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        type="button"
        className="flex justify-between items-center w-full no-underline link"
      >
        Categories
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 duration-200 ${
            isOpen ? "transform rotate-180 " : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="space-y-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/blog/category/${category.slug}`}
                className="text-base-content/80 hover:text-base-content duration-100 link link-hover"
              >
                {category?.titleShort || category.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

// This is the header that appears on all pages in the /blog folder.
// By default it shows the logo, the links, and the CTA.
// In the links, there's a popover with the categories.
const HeaderBlog = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-base-300 shadow-lg">
      <nav className="flex justify-between items-center mx-auto px-8 py-3 max-w-7xl">
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">{config.appName}</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex justify-center items-center -m-2.5 p-2.5 rounded-box"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="lg:flex lg:justify-center lg:items-center lg:gap-12 hidden">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="text-base-content/80 hover:text-base-content focus:text-base-content active:text-base-content duration-100 link link-hover"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}

          <ButtonPopoverCategories />
        </div>

        {/* CTA on large screens */}
        <div className="lg:flex lg:flex-1 lg:justify-end hidden">{cta}</div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-3 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex justify-between items-center">
            <Link
              className="flex items-center gap-2 shrink-0"
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
              />
              <span className="font-extrabold text-lg">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 p-2.5 rounded-box"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="mt-6 flow-root">
            <div className="py-4">
              <div className="flex flex-col items-start gap-y-4">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="link link-hover"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
                <ButtonAccordionCategories />
              </div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            <div className="flex flex-col">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBlog;
