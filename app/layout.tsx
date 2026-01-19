import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/web/footer";
import { Navbar } from "@/components/web/navbar";

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/Satoshi-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Satoshi-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/Satoshi-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/Satoshi-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-BlackItalic.woff",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Zicket",
    default: "Zicket",
  },
  description: "Host Freely. Attend Silently.",
  keywords: ["tickets", "events", "nft", "booking"],
  authors: [{ name: "Zicket Team" }],
  openGraph: {
    title: "Zicket",
    description: "Host Freely. Attend Silently.",
    url: "https://zicket.app",
    siteName: "Zicket",
    images: [
      {
        url: "/og-image.jpg", // Assuming an image will exist or user will add one
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zicket",
    description: "Host Freely. Attend Silently.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshi.variable} ${inter.variable} ${bricolage.variable} font-sans antialiased`}>
        <Navbar />
        <div id="page-wrapper" className="bg-white">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
