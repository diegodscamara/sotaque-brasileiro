import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ReactNode } from "react";
import { Suspense } from "react";
import config from "@/config";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-between items-center mx-auto p-8 container">
        {children}
      </main>
      <Footer />
    </>
  );
}
