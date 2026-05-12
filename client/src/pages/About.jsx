import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhyUsSection from '../components/sections/WhyUsSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import { Target, Users, MapPin, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="section-tag">Our Story</div>
              <h1 className="text-4xl sm:text-6xl font-black text-white mt-4 mb-6 leading-tight">
                Revolutionizing <span className="gradient-text">Rental Mobility</span> in India
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                RentiGo was founded in Dwarka, Gujarat, with a simple mission: to make vehicle rental as easy as ordering food online. We saw a gap in the market for reliable, transparent, and affordable vehicle rentals and decided to bridge it with technology.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="glass p-4 rounded-2xl border-white/5">
                  <div className="text-3xl font-black gradient-text mb-1">50+</div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Cities Covered</div>
                </div>
                <div className="glass p-4 rounded-2xl border-white/5">
                  <div className="text-3xl font-black gradient-text mb-1">10k+</div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Active Users</div>
                </div>
              </div>
              <Link to="/rentals" className="btn-primary">View Our Fleet</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="relative h-[400px] sm:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-3xl overflow-hidden glass border-white/10">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop" alt="RentiGo Car" className="w-full h-full object-cover opacity-60" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl border-white/10 max-w-[240px] shadow-glow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-white font-bold text-sm">Verified Service</span>
                </div>
                <p className="text-slate-400 text-xs">Every vehicle in our fleet undergoes a 50-point quality check.</p>
              </div>
            </motion.div>
          </div>

          <WhyUsSection />

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-24 mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass p-10 rounded-3xl border-white/5 hover:border-orange-500/20 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed">To provide seamless access to affordable and high-quality vehicles for every traveler in India, empowering mobility and freedom across cities.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass p-10 rounded-3xl border-white/5 hover:border-orange-500/20 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">To become India's most trusted and sustainable rental ecosystem, where owning a vehicle becomes a choice, not a necessity.</p>
            </motion.div>
          </div>

          <HowItWorksSection />

          {/* Awards */}
          <div className="text-center mt-20">
            <div className="section-tag mx-auto">Recognition</div>
            <h2 className="text-3xl font-black text-white mt-4 mb-12">Built with <span className="gradient-text">Excellence</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Startup of the Year 2026', icon: Award },
                { label: 'Customer Trust Award', icon: ShieldCheck },
                { label: 'Top Mobility Platform', icon: MapPin },
                { label: 'Gujarat Tech Innovators', icon: Zap },
              ].map((award, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-orange-500 mb-4 border border-white/5">
                    {award.icon && <award.icon size={28} />}
                  </div>
                  <span className="text-slate-300 font-bold text-sm">{award.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
