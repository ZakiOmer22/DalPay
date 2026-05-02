import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Toaster } from "react-hot-toast";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DalPay — Digital Tax Payment System | Ministry of Finance",
    template: "%s | DalPay",
  },
  description:
    "DalPay enables citizens of Somaliland to pay taxes digitally using mobile money — Zaad, eDahab, and more. Fast, secure, government-recognised.",
  keywords: [
    "DalPay",
    "tax payment",
    "Somaliland tax",
    "digital tax",
    "mobile money tax",
    "Zaad tax",
    "eDahab tax",
    "Ministry of Finance",
    "government payment",
  ],
  icons: {
    icon: "/dalpay-icon.png",
    shortcut: "/dalpay-icon.png",
    apple: "/dalpay-icon.png",
  },
  openGraph: {
    title: "DalPay — Digital Tax Payment System",
    description:
      "Pay your taxes conveniently using mobile money. Official digital tax platform of the Ministry of Finance, Somaliland.",
    url: "https://dalpay.gov.so",
    siteName: "DalPay",
    locale: "en_GB",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DalPay — Ministry of Finance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DalPay — Digital Tax Payment System",
    description:
      "Pay your taxes conveniently using mobile money. Official digital tax platform of the Ministry of Finance, Somaliland.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://dalpay.gov.so"),
};

const toastOptions = {
  style: {
    background: "#0a1628",
    color: "#f5f5f0",
    border: "1px solid #1e3a5f",
    borderRadius: "8px",
    fontFamily: "DM Sans, sans-serif",
  },
  success: {
    iconTheme: { primary: "#16a34a", secondary: "#0a1628" },
  },
  error: {
    iconTheme: { primary: "#ef4444", secondary: "#0a1628" },
  },
} as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/dalpay-icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/dalpay-icon.png" />
        <meta name="theme-color" content="#0a1628" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} antialiased bg-[#0a1628] text-[#e2e8f0]`}>
        <Providers>
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-right" toastOptions={toastOptions} />
        </Providers>
      </body>
    </html>
  );
}