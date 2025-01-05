"use client";

import { House } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const renderBreadcrumbs = () => {
    return pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;

      return (
        <li key={href}>
          {isLast ? (
            capitalizeFirstLetter(segment)
          ) : (
            <Link href={href}>{capitalizeFirstLetter(segment)}</Link>
          )}
        </li>
      );
    });
  };

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        <li>
          <Link href="/" className="flex items-center gap-2">
            <House  className="w-4 h-4" />
            Home
          </Link>
        </li>
        {renderBreadcrumbs()}
      </ul>
    </div>
  );
};
export default Breadcrumb;
