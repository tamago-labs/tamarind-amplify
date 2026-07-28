"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductHighlights from "@/components/landing/ProductHighlights";
import Features from "@/components/landing/Features";
import UserFlow from "@/components/landing/UserFlow";
import OneLiner from "@/components/landing/OneLiner";
import GlobalPayroll from "@/components/landing/GlobalPayroll";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-panel">
      <Navbar />
      <Hero />
      <ProductHighlights />
      <Features />
      <UserFlow />
      <OneLiner />
      <GlobalPayroll />
      <CTA />
      <Footer />
    </main>
  );
}
