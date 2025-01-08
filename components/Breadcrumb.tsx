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

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BreadcrumbComponent = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const renderBreadcrumbs = () => {
    return pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;

      return (
        <BreadcrumbItem key={href}>
          {isLast ? (
            <BreadcrumbPage>{capitalizeFirstLetter(segment)}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink>
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
          <BreadcrumbLink>
            <Link href="/" className="flex items-center gap-2">
              <House className="w-4 h-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {renderBreadcrumbs()}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
