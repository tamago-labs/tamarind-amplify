import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tamarind",
  description: "Tamarind application",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
