"use client";

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
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        {renderBreadcrumbs()}
      </ul>
    </div>
  );
};
export default Breadcrumb;
