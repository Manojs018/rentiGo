import { motion } from 'framer-motion';
import { Clock, DollarSign, Shield, Star } from 'lucide-react';

const features = [
  { icon: Clock, title: '24/7 Service', desc: 'Book anytime, day or night. We are always available to serve you.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: DollarSign, title: 'Affordable Pricing', desc: 'Transparent pricing with no hidden charges. Best rates guaranteed.', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { icon: Shield, title: 'Safe & Secure', desc: 'Insured rides with well-maintained and regularly serviced vehicles.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Star, title: 'Professional Drivers', desc: 'Experienced and verified drivers who prioritize your safety.', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

export default function WhyUsSection() {
  return (
    <section className="section py-24 relative" id="why-us">
      <div className="blob blob-orange w-[400px] h-[400px] absolute top-20 right-0 opacity-[0.05]" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>🚀 Why Choose Us</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Why <span className="gradient-text">RentiGo?</span>
          </motion.h2>
          <motion.p className="text-slate-400 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            We provide reliable, safe, and affordable rental services for everyone.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass card-glow rounded-2xl p-6 flex flex-col gap-4 border border-white/[0.07] hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow group"
            >
              <div className={`w-12 h-12 ${feat.bg} border ${feat.border} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon size={22} className={feat.color} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
