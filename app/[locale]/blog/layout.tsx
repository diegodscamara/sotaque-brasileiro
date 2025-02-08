import Footer from "@/components/landing-page/Footer";
import HeaderBlog from "./_assets/components/HeaderBlog";
import { Suspense } from "react";

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <div>
      <Suspense>
        <HeaderBlog />
      </Suspense>

      <main className="mx-auto p-8 max-w-6xl min-h-screen">{children}</main>

      <div className="h-24" />

      <Footer />
    </div>
  );
}
