import "./globals.css";

import ClientLayout from "@/components/LayoutClient";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import SupabaseProvider from "./providers/SupabaseProvider";
import { Toaster } from 'react-hot-toast';
import { Viewport } from "next";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
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
			data-theme={config.colors.theme}
			className={font.className}
		>
			<body>
				<Toaster />
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<SupabaseProvider>
					<ClientLayout>{children}</ClientLayout>
				</SupabaseProvider>
			</body>
		</html>
	);
}
