import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

config.autoAddCss = false;

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Garva · Swipe for a laugh",
  description:
    "Garva serves an endless stream of lightweight jokes with a Tinder-style swipe deck.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased bg-slate-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
