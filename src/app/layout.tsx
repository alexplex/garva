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
  title: "Garva · Sveriges roligaste skämt",
  description:
    "Browsa genom Sveriges roligaste skämt och rösta på dina favoriter!",
  keywords: ["skämt", "humor", "roligt", "svenska skämt", "garva"],
  authors: [{ name: "Garva" }],
  metadataBase: new URL("https://garva.se"),
  openGraph: {
    title: "Garva · Sveriges roligaste skämt",
    description: "Browsa genom Sveriges roligaste skämt och rösta på dina favoriter!",
    url: "https://garva.se",
    siteName: "Garva",
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Garva · Sveriges roligaste skämt",
    description: "Browsa genom Sveriges roligaste skämt och rösta på dina favoriter!",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
