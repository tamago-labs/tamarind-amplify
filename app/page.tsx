"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductHighlights from "@/components/landing/ProductHighlights";
import Features from "@/components/landing/Features";
import SupportedChains from "@/components/landing/SupportedChains";
import OriginationLifecycle from "@/components/landing/OriginationLifecycle";
import UserFlow from "@/components/landing/UserFlow";
import RealWorldExample from "@/components/landing/RealWorldExample";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-panel">
      <Navbar />
      <Hero />
      <ProductHighlights />
      <Features />
      <SupportedChains />
      <OriginationLifecycle />
      <UserFlow />
      <RealWorldExample />
      <CTA />
      <Footer />
    </main>
  );
}
