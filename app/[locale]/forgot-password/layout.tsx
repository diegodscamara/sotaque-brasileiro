import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Reset your password to ${config.appName}`,
  canonicalUrlRelative: "/auth/forgot-password",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
