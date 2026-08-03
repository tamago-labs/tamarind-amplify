"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductHighlights from "@/components/landing/ProductHighlights";
import OriginationLifecycle from "@/components/landing/OriginationLifecycle";
import SupportedChains from "@/components/landing/SupportedChains";
import RealWorldExample from "@/components/landing/RealWorldExample";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-panel">
      <Navbar />
      <Hero />
      <ProductHighlights />
      <OriginationLifecycle />
      <SupportedChains />
      <RealWorldExample />
      <CTA />
      <Footer />
    </main>
  );
}
