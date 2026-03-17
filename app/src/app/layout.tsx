import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foundation by Ascension",
  description: "Home improvement planning for couples — track projects, budgets, materials, and blueprints in one place.",
  keywords: ["home improvement", "renovation", "project planning", "couples", "DIY"],
  openGraph: {
    title: "Foundation by Ascension",
    description: "Home improvement planning for couples",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${dmSans.variable}`}>
      <body>
        <div className="atmo" aria-hidden="true" />
        <div className="grid-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
