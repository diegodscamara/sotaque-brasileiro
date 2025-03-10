"use client";

import React, { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import LanguageSwitcher from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthenticatedClientLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  actions?: ReactNode;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function AuthenticatedClientLayout({
  children,
  pageTitle,
  actions,
}: AuthenticatedClientLayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();

  // Filter out the locale segment from the path
  const pathSegments = pathname.split("/").filter(segment => segment !== locale && segment !== "");

  // Get the current page title from the last path segment or use the provided pageTitle
  const currentPageTitle = pageTitle || (pathSegments.length > 0 ? capitalizeFirstLetter(pathSegments[pathSegments.length - 1]) : "Dashboard");

  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex items-center gap-2 h-16 transition-[width,height] ease-linear shrink-0">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="bg-gray-300 dark:bg-gray-600 mr-2 h-4" />
            <div className="flex justify-between items-center gap-2 w-full">
              <h1 className="font-semibold text-lg">{currentPageTitle}</h1>
              {actions && (
                <div className="ml-4">
                  {actions}
                </div>
              )}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 