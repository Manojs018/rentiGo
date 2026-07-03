import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import FleetSection from '../components/sections/FleetSection';
import CitiesSection from '../components/sections/CitiesSection';
import WhyUsSection from '../components/sections/WhyUsSection';
import SmartRideTeaser from '../components/sections/SmartRideTeaser';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import VehiclesSection from '../components/sections/VehiclesSection';
import PricingSection from '../components/sections/PricingSection';
import FAQSection from '../components/sections/FAQSection';
import PartnerSection from '../components/sections/PartnerSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-900 relative">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FleetSection />
        <CitiesSection />
        <WhyUsSection />
        <SmartRideTeaser />
        <HowItWorksSection />
        <VehiclesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <PartnerSection />
      </main>
      <Footer />
    </div>
  );
}
