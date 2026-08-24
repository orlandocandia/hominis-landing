'use client';

import { WhatsAppButton } from '@/components/whatsapp-button';
import { UtmCapturer } from '@/components/utm-capturer';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PlansSection } from '@/components/landing/PlansSection';
import { PromotionsSection } from '@/components/landing/PromotionsSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { ContactSection } from '@/components/landing/ContactSection';

/* ─── MAIN PAGE ─── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <UtmCapturer />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <PlansSection />
        <PromotionsSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
