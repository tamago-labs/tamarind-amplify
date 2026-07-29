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
  title: "Tamarind — Compliant Web3 Payroll & Payroll RWA Marketplace",
  description:
    "Run compliant global payroll with CVI-verified identities, immutable Merkle-rooted payroll records, and fiat or digital asset settlement. Originate Payroll RWAs and connect companies with investors through a trusted marketplace.",
  keywords: [
    "Web3 Payroll",
    "Payroll RWA",
    "Payroll Receivables",
    "Payroll Marketplace",
    "Payroll Infrastructure",
    "RWA Marketplace",
    "Cleanverse",
    "CVI",
    "CVA",
    "Merkle Proof",
    "Digital Asset Payroll",
    "Global Payroll",
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
