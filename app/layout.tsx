import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "@aws-amplify/ui-react/styles.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tamarind — Compliance Infrastructure for Programmable Finance",
  description:
    "Tamarind is compliance infrastructure for programmable finance. Manage payroll, invoices, and financial records in one workspace, then convert verified obligations into compliant RWAs for settlement and financing.",
  keywords: [
    "Compliance Infrastructure",
    "Programmable Finance",
    "RWA Origination",
    "CVI",
    "CVA",
    "Cleanverse",
    "Financial Records",
    "Merkle Proof",
    "On-Chain Settlement",
    "Digital Assets",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.className} ${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
