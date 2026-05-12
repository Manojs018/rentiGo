import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PricingSection from '../components/sections/PricingSection';
import { Info, Shield, CreditCard, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <PricingSection />

          {/* Pricing Policy Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass p-8 rounded-3xl border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                <Info size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Refund Policy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Cancel up to 24 hours before your trip for a full refund. Cancellations made within 24 hours are subject to a 20% processing fee.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Damage Policy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Vehicles are insured. In case of minor damage, the customer is liable for up to the security deposit amount. Major damages are covered by insurance.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass p-8 rounded-3xl border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
              <p className="text-slate-400 text-sm leading-relaxed">We accept all major credit/debit cards, UPI, and net banking. Secure payment processing via our verified partners.</p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-20 glass card-glow rounded-3xl p-10 sm:p-16 border-orange-500/10 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to <span className="gradient-text">Start Your Trip?</span></h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join thousands of happy customers who trust RentiGo for their daily and outstation travel needs.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/rentals" className="btn-primary px-8">Browse All Vehicles <ArrowRight size={18} /></Link>
              <Link to="/contact" className="btn-ghost px-8 flex items-center gap-2"><HelpCircle size={18} /> Speak with Support</Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
