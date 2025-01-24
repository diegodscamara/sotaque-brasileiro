import "./globals.css";

import { Analytics } from "@vercel/analytics/react"
import ClientLayout from "@/components/LayoutClient";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import SupabaseProvider from "./providers/SupabaseProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${font.className}`}
			suppressHydrationWarning
		>
			<head />
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
					<SupabaseProvider>
						{/* <ScrollProgress className="top-[65px]" /> */}
						<ClientLayout>{children}</ClientLayout>
						<Analytics />
						<SpeedInsights />
						<Toaster />
					</SupabaseProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
