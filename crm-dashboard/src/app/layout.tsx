import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM Dashboard",
  description: "Dashboard CRM Fondateur",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${dmMono.variable} ${syne.variable}`}
    >
      <body className="antialiased font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
