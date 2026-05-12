import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: '🪪 What documents are required to rent a vehicle?', a: 'You need a valid driving license, Aadhaar card or any government-issued ID proof, and a security deposit (refundable).' },
  { q: '⛽ Is fuel included in the rental price?', a: 'Fuel is not included in our rental plans. You are responsible for refueling the vehicle. Please return it with the same fuel level as pickup.' },
  { q: '📅 Can I cancel my booking?', a: 'Yes, you can cancel your booking up to 24 hours before pickup for a full refund. Late cancellations may incur a 20% charge.' },
  { q: '👨‍✈️ Are drivers available with vehicles?', a: 'Yes! We offer driver-assisted taxi services. For self-drive vehicles, a valid license is required. Contact us to arrange a driver for any vehicle.' },
  { q: '⏱️ What is the minimum rental duration?', a: 'The minimum rental duration is 1 day (24 hours). Weekly and monthly plans offer better value for longer rentals.' },
  { q: '🛬 Do you provide airport pickup/drop services?', a: 'Yes! We offer airport pickup and drop services across all our cities. Book in advance to ensure vehicle availability.' },
  { q: '🛣️ Can I take the vehicle outstation?', a: 'Yes, outstation travel is allowed with prior intimation. Additional charges may apply based on distance. Contact us for outstation pricing.' },
  { q: '⏳ What happens if I return the vehicle late?', a: 'Late returns are charged at an hourly rate. If you need an extension, please inform us at least 2 hours before the scheduled return time.' },
  { q: '🚗 Are the vehicles insured?', a: 'All our vehicles are fully insured. However, you are responsible for any traffic violations or damage caused due to negligence.' },
  { q: '💰 Is there a security deposit?', a: 'Yes, a refundable security deposit is required at the time of booking. It is returned within 3-5 business days after vehicle return without damage.' },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden hover:border-orange-500/20 transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className="text-white font-medium text-sm sm:text-base">{faq.q}</span>
        <ChevronDown
          size={18}
          className={`text-orange-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const toggle = (i) => setOpenIdx(openIdx === i ? -1 : i);

  return (
    <section className="section py-24" id="faq">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>❓ FAQ</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
          <motion.p className="text-slate-400 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            Everything you need to know about renting with RentiGo.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <FAQItem faq={faq} isOpen={openIdx === i} onToggle={() => toggle(i)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
