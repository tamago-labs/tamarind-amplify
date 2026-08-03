import type { Metadata } from "next";
import AppAuth from "@/components/app/AppAuth";

export const metadata: Metadata = {
  title: "Tamarind",
  description: "Tamarind application",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppAuth>{children}</AppAuth>;
}
