"use client";

import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import ButtonSignin from "@/components/ButtonSignin";
import Image from "next/image";
import LanguageSwitcher from "@/components/lang-switcher";
import Link from "next/link";
import { List } from "@phosphor-icons/react";
import { User } from "@supabase/supabase-js";
import { cn } from "@/libs/utils";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import logo from "@/app/icon.png";
import { useSearchParams } from "next/navigation";
import useStudentApi from "@/hooks/useStudentApi";
import { useTranslations } from "next-intl";

const Header = () => {
  const { getStudent } = useStudentApi();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const t = useTranslations('landing.header');

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Update header background based on scroll
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 10);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser();

        if (user) {
          const student = await getStudent(user.id);
          setHasAccess(student?.hasAccess || false);
        }

        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    getUser();
  }, [getStudent]);

  const links = [
    { href: t("nav.featuresLink"), label: t("nav.features") },
    { href: t("nav.howItWorksLink"), label: t("nav.howItWorks") },
    { href: t("nav.pricingLink"), label: t("nav.pricing") },
    { href: t("nav.faqLink"), label: t("nav.faq") }
  ];

  return (
    <AnimatePresence>
      <motion.header
        className={cn(
          "fixed top-0 w-full z-50 border-b transition-colors duration-200",
          isScrolled
            ? "bg-gray-50/60 dark:bg-gray-800/60 backdrop-blur-lg border-border"
            : "bg-transparent border-transparent"
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="flex justify-between items-center mx-auto px-4 max-w-7xl h-14 container">
          {/* Logo */}
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
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

          {/* Desktop Navigation */}
          <div className="lg:flex lg:items-center lg:gap-2 hidden">
            {links.map((link) => (
              <Button
                variant="link"
                effect="hoverUnderline"
                className="text-gray-800 dark:text-gray-50"
                key={link.href}
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="lg:flex lg:items-center gap-4 hidden">
            <LanguageSwitcher />
            {user && hasAccess ? (
              <>
                <Button variant="default" asChild>
                  <Link href={t("nav.dashboardLink")}>{t("nav.dashboard")}</Link>
                </Button>
                <ButtonSignin />
              </>
            ) : (
              <>
                <ButtonSignin />
                <Button variant="default" asChild effect="shineHover">
                  <Link href={t("cta.link")}>{t("cta.primary")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <List className="w-6 h-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-100 dark:bg-gray-800 w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <SheetHeader className="flex justify-between">
                  <SheetTitle className="font-bold text-lg">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image
                        src={logo}
                        alt={`${config.appName} logo`}
                        className="w-8"
                        width={32}
                        height={32}
                      />
                      <span className="font-bold">{config.appName}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col items-start gap-4 mt-8">
                  <nav className="flex flex-col items-start gap-4">
                    {links.map((link) => (
                      <Button variant="link" effect="hoverUnderline" className="px-0 text-gray-800 dark:text-gray-50" key={link.href} asChild>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </Button>
                    ))}
                  </nav>

                  <div className="flex flex-col sm:flex-col items-start gap-6">
                    <LanguageSwitcher />
                    {user && hasAccess ? (
                      <div className="flex flex-col items-start gap-6 sm:m-0">
                        <Button variant="default" asChild effect="shineHover">
                          <Link href={t("nav.dashboardLink")}>{t("nav.dashboard")}</Link>
                        </Button>
                        <ButtonSignin />
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-6 sm:m-0">
                        <ButtonSignin />
                        <Button variant="default" asChild effect="shineHover">
                          <Link href={t("cta.link")}>{t("cta.primary")}</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </motion.header>
    </AnimatePresence>
  );
};

export default Header;
