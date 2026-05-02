export const metadata = {
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DalPay — Ministry of Finance",
      },
    ],
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