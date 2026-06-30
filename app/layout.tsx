import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const siteUrl = process.env.APP_URL || "http://localhost:3000";

const siteTitle = "خلوت | دفتر دیجیتال شخصی برای نوشته‌ها، وظایف و عادت‌ها";
const siteDescription =
  "خلوت یک دفتر دیجیتال شخصی و بولت ژورنال آنلاین برای ثبت نوشته‌ها، ایده‌ها، وظایف، شکرگزاری، عادت‌ها، یادآورها و شعر روز است.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    icon: [{ url: "/faveicon.png", type: "image/png" }],
    shortcut: "/faveicon.png",
    apple: "/faveicon.png",
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
