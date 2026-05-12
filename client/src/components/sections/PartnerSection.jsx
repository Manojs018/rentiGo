import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, List, ArrowRight } from 'lucide-react';

export default function PartnerSection() {
  return (
    <section className="section py-24 relative overflow-hidden" id="partner">
      <div className="blob blob-orange w-[600px] h-[400px] absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.07]" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="glass card-glow rounded-3xl p-8 sm:p-14 text-center border border-orange-500/10">
          <motion.div className="section-tag mx-auto mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>📢 Partner Program</motion.div>
          <motion.h2 className="text-3xl sm:text-5xl font-black text-white mb-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Join RentiGo and <span className="gradient-text">Start Earning</span> Today
          </motion.h2>
          <motion.p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            List your vehicle on RentiGo and reach thousands of customers across Gujarat. Start earning extra income from your idle vehicle in just 2 minutes!
          </motion.p>

          {/* Earnings simulation */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { label: 'Monthly Earnings', value: '₹18,000+', icon: '💰', desc: 'Average car owner' },
              { label: 'Avg Bookings/Month', value: '22', icon: '📅', desc: 'Per listed vehicle' },
              { label: 'Rating Average', value: '4.8★', icon: '⭐', desc: 'Platform wide' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-black gradient-text mb-1">{item.value}</div>
                <div className="text-slate-300 text-sm font-medium">{item.label}</div>
                <div className="text-slate-500 text-xs mt-1">{item.desc}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-base px-8 py-3.5">
              <List size={18} /> List Now <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-ghost text-base px-8 py-3.5">
              <TrendingUp size={18} /> Earnings Simulator
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
