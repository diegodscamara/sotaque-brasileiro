"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { House } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BreadcrumbComponent = () => {
  const pathname = usePathname();
  const locale = useLocale();
  
  // Filter out the locale segment from the path
  const pathSegments = pathname.split("/").filter(segment => segment !== locale && segment !== "");

  const renderBreadcrumbs = () => {
    return pathSegments.map((segment, index) => {
      // Reconstruct the href with the locale
      const href = `/${locale}/${pathSegments.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSegments.length - 1;

      return (
        <BreadcrumbItem key={href}>
          {isLast ? (
            <BreadcrumbPage>{capitalizeFirstLetter(segment)}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href}>{capitalizeFirstLetter(segment)}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      );
    });
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <House className="w-4 h-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator />}
        {renderBreadcrumbs()}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
