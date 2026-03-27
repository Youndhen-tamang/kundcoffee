"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-8 font-sans antialiased selection:bg-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "KundCoffee",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "NPR"
            },
            "description": "Premium Restaurant & Cafe POS System in Kathmandu. Streamline your operations with KundCoffee.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "ratingCount": "1"
            }
          }),
        }}
      />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-zinc-950">
          Coming Soon
        </h1>

        {/* Decorative Line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeInOut" }}
          className="h-px bg-zinc-200 w-16 mx-auto mb-6"
        />

        {/* Description */}
        <p className="text-zinc-500 text-sm md:text-base font-medium tracking-wide uppercase leading-relaxed">
          The new digital experience for <br />
          <span className="text-zinc-950 font-bold">Kund Coffee</span>
        </p>

        {/* Footer info (Subtle) */}
        <footer className="mt-20">
          <p className="text-zinc-300 text-[10px] font-bold tracking-[0.3em] uppercase">
            EST. 2026
          </p>
        </footer>
      </motion.div>
    </main>
  );
}