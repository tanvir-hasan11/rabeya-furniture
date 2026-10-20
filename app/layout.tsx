import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { getSiteSettings } from "@/lib/data";

const hiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla-src",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "রাবেয়া ফার্নিচার — হাতে তৈরি হোম ডেকোর",
    template: "%s | রাবেয়া ফার্নিচার",
  },
  description:
    "বাংলাদেশের হাতে তৈরি প্রিমিয়াম হোম ডেকোর ও ফার্নিচার স্টোর। ক্যাশ অন ডেলিভারি, দ্রুত ডেলিভারি।",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <html lang="bn" className={`${hiliguri.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header settings={settings} />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <Footer settings={settings} />
          <BottomNav />
          <WhatsAppFloat whatsapp={settings.whatsapp} />
        </Providers>
      </body>
    </html>
  );
}
