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
  title: "Tamarind — The Web3 Payment Workspace for RWA Origination",
  description:
    "The Web3 payment workspace for RWA origination. Run compliant payments, verify records with CVI and Merkle proof, and invest in CVA-verified RWAs as ERC-20 tokens.",
  keywords: [
    "Web3 Payments",
    "RWA Origination",
    "ERC-20 Tokens",
    "CVI",
    "CVA",
    "Cleanverse",
    "Merkle Proof",
    "Compliant Payments",
    "Staking Pools",
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
