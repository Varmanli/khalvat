import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Toaster } from "sonner";
import { PwaBootstrap } from "@/components/pwa/pwa-bootstrap";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const siteUrl = process.env.APP_URL || "http://localhost:3000";

const siteTitle = "خلوت | دفتر دیجیتال شخصی برای نوشته‌ها، وظایف و عادت‌ها";
const siteDescription =
  "فضایی آرام برای عادت‌ها، نوشته‌ها، وظایف و حال روزانه";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8A5A44",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "خلوت",
  manifest: "/manifest.webmanifest",
  title: {
    default: siteTitle,
    template: "%s | خلوت",
  },
  description: siteDescription,
  keywords: [
    "خلوت",
    "دفتر دیجیتال",
    "دفتر شخصی",
    "بولت ژورنال آنلاین",
    "یادداشت فارسی",
    "مدیریت وظایف",
    "ثبت عادت",
    "شکرگزاری روزانه",
    "یادآور",
    "نوشتن روزانه",
  ],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "خلوت",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "خلوت",
    locale: "fa_IR",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>
        {children}
        <PwaBootstrap />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily:
                "var(--font-vazirmatn), Vazirmatn, Tahoma, Arial, sans-serif",
              direction: "rtl",
              borderRadius: "1rem",
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px 0 rgba(90,60,40,0.10)",
            },
          }}
        />
      </body>
    </html>
  );
}
