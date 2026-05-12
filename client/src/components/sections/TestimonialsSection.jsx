import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: 'Arjun Patel', city: 'Ahmedabad', rating: 5, avatar: '👨', comment: 'RentiGo made my trip so easy! Booked a car in minutes and it was delivered to my doorstep. Highly recommend their service.' },
  { name: 'Priya Sharma', city: 'Surat', rating: 5, avatar: '👩', comment: 'Amazing experience! The Activa was in perfect condition. Very affordable for daily commute. Will definitely use again.' },
  { name: 'Rahul Mehta', city: 'Vadodara', rating: 4, avatar: '🧑', comment: 'Professional service and transparent pricing. No hidden charges. The driver was polite and on time for airport pickup.' },
  { name: 'Sneha Joshi', city: 'Rajkot', rating: 5, avatar: '👧', comment: 'Best rental service in Rajkot! Booked a bike for a week and it was a fantastic experience. Great customer support too.' },
  { name: 'Vishal Khatri', city: 'Ahmedabad', rating: 5, avatar: '👨‍💼', comment: 'Used RentiGo for a business trip. SUV was spotless, driver very professional. Will use for all future corporate travel.' },
];

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx(i => (i + 1) % testimonials.length);

  const visible = [
    testimonials[idx],
    testimonials[(idx + 1) % testimonials.length],
    testimonials[(idx + 2) % testimonials.length],
  ];

  return (
    <section className="section py-24" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>⭐ Reviews</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            What Our <span className="gradient-text">Customers Say</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visible.map((t, i) => (
            <motion.div
              key={idx + i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass card-glow rounded-2xl p-6 border border-white/[0.07] hover:border-orange-500/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center text-xl">{t.avatar}</div>
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-xs">📍 {t.city}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">"{t.comment}"</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={prev} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-all">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5 items-center">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
