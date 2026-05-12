import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap } from 'lucide-react';

const plans = [
  { id: 'daily', name: 'Daily Plan', tagline: 'Best for short city rides or quick errands.', price: '₹250', unit: '/day', features: ['Cars, Bikes, Activas, Taxis', 'Flexible pickup & drop', 'Fuel not included', 'Cancel anytime'], color: 'border-white/10' },
  { id: 'weekly', name: 'Weekly Plan', tagline: 'Perfect for tourists and business trips.', price: '₹1,500', unit: '/week', features: ['Discounted rates', 'Unlimited kilometers option', '24/7 support', 'Free cancellation 48h'], color: 'border-orange-500/40', recommended: true },
  { id: 'monthly', name: 'Monthly Plan', tagline: 'Ideal for long-term rental needs.', price: '₹4,500', unit: '/month', features: ['Best value pricing', 'Free service & maintenance', 'Option to swap vehicles', 'Priority support'], color: 'border-white/10' },
];

const table = [
  { type: 'Cars 🚗', daily: '₹1,200', weekly: '₹7,000', monthly: '₹20,000' },
  { type: 'Bikes 🏍️', daily: '₹300', weekly: '₹1,500', monthly: '₹4,500' },
  { type: 'Activas 🛵', daily: '₹280', weekly: '₹1,400', monthly: '₹4,000' },
  { type: 'Taxis 🚖', daily: '₹15/km', weekly: 'Custom', monthly: 'Custom' },
];

export default function PricingSection() {
  return (
    <section className="section py-24" id="pricing">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>💰 Pricing</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Transparent, <span className="gradient-text">Affordable</span> Plans
          </motion.h2>
          <motion.p className="text-slate-400 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            Transparent pricing with no hidden charges. Pick a plan that works for you.
          </motion.p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative glass rounded-2xl p-7 border ${plan.color} transition-all hover:-translate-y-2 hover:shadow-glow ${plan.recommended ? 'ring-1 ring-orange-500/40' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-glow-sm">
                    <Zap size={11} className="fill-white" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.tagline}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-slate-400 text-sm">From</span>
                <span className="text-4xl font-black gradient-text">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.unit}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check size={15} className="text-orange-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <Link to="/booking" className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.recommended ? 'btn-primary' : 'btn-ghost'}`}>
                Book Now <ArrowRight size={15} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pricing Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass card-glow rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-white font-bold text-xl">Vehicle Pricing Table</h3>
            <p className="text-slate-400 text-sm mt-1">Detailed per-vehicle pricing breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Vehicle Type', 'Daily', 'Weekly', 'Monthly'].map(h => (
                    <th key={h} className="text-left py-4 px-6 text-sm font-semibold text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={row.type} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="py-4 px-6 text-white font-medium">{row.type}</td>
                    <td className="py-4 px-6 text-orange-400 font-semibold">{row.daily}</td>
                    <td className="py-4 px-6 text-orange-400 font-semibold">{row.weekly}</td>
                    <td className="py-4 px-6 text-orange-400 font-semibold">{row.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
