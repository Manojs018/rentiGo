import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle } from 'lucide-react';

const cities = [
  { name: 'Ahmedabad', desc: 'Now available for Car, Bike & Taxi rentals.', emoji: '🏙️', color: 'from-orange-600/80 to-amber-700/80', bg: 'from-orange-500/10 to-orange-600/5', vehicles: '120+ Vehicles' },
  { name: 'Surat', desc: 'Reliable rentals with affordable pricing.', emoji: '🌆', color: 'from-blue-600/80 to-indigo-700/80', bg: 'from-blue-500/10 to-blue-600/5', vehicles: '85+ Vehicles' },
  { name: 'Vadodara', desc: 'Serving all major locations of the city.', emoji: '🌃', color: 'from-purple-600/80 to-pink-700/80', bg: 'from-purple-500/10 to-purple-600/5', vehicles: '60+ Vehicles' },
  { name: 'Rajkot', desc: 'Safe and comfortable rides for all needs.', emoji: '🏘️', color: 'from-green-600/80 to-teal-700/80', bg: 'from-green-500/10 to-green-600/5', vehicles: '45+ Vehicles' },
];

export default function CitiesSection() {
  return (
    <section className="section py-24" id="cities">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>🌍 Our Cities</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Services Across <span className="gradient-text">Gujarat</span>
          </motion.h2>
          <motion.p className="text-slate-400 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            We're expanding rapidly across major cities. Book in your city today!
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city, i) => (
            <motion.div key={city.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group relative overflow-hidden rounded-2xl cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${city.bg} border border-white/[0.07] rounded-2xl group-hover:border-orange-500/20 transition-all`} />
              <div className="relative z-10 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${city.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>{city.emoji}</div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Available
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl flex items-center gap-2"><MapPin size={16} className="text-orange-400" />{city.name}</h3>
                  <p className="text-slate-400 text-sm mt-1.5">{city.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle size={14} className="text-orange-400" />{city.vehicles}</div>
                <Link to="/cities" className="mt-2 w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-transparent text-sm font-semibold text-slate-300 hover:text-white transition-all duration-300">Book in {city.name}</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
