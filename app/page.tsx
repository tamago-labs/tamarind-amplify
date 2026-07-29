"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductHighlights from "@/components/landing/ProductHighlights";
import Features from "@/components/landing/Features";
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
      <UserFlow />
      <RealWorldExample />
      <CTA />
      <Footer />
    </main>
  );
}
