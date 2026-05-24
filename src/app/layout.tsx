import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/context/auth";
import { ToastProvider } from "@/components/ui/toast";
import { BRAND, BRAND_METADATA } from "@/lib/branding";
import { appConfig } from "@/lib/config/env";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url || "http://localhost:3000"),
  title: {
    default: BRAND_METADATA.title,
    template: `%s | ${BRAND.appName}`,
  },
  description: BRAND.description,
  applicationName: BRAND.appName,
  icons: {
    icon: BRAND.faviconPath,
    shortcut: BRAND.faviconPath,
    apple: BRAND.logoIconPath,
  },
  openGraph: {
    title: BRAND_METADATA.openGraphTitle,
    description: BRAND.description,
    siteName: BRAND.appName,
    images: [
      {
        url: BRAND.logoBlackPath,
        width: 600,
        height: 241,
        alt: BRAND.appName,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
