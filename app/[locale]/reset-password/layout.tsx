import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Set new password for ${config.appName}`,
  canonicalUrlRelative: "/auth/reset-password",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
