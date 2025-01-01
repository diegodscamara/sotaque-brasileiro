import Footer from "@/components/Footer";
import Header from "@/components/landing-page/Header";
import { ReactNode } from "react";
import { Suspense } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
