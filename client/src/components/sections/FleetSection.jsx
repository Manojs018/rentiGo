import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Fuel, Zap } from 'lucide-react';

const fleet = [
  {
    id: 1,
    emoji: '🚙',
    type: 'SUV Car',
    desc: 'Comfortable rides for families & city travel. Perfect for long trips and group outings.',
    features: ['7 Seater', 'AC', 'GPS', 'Spacious'],
    price: '₹1,200/day',
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'hover:border-blue-500/30',
    badge: 'Popular',
  },
  {
    id: 2,
    emoji: '🏍️',
    type: 'Bike',
    desc: 'Quick & budget-friendly option for solo rides. Ideal for daily commutes.',
    features: ['Solo', 'Fuel Efficient', 'Easy Parking'],
    price: '₹300/day',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'hover:border-green-500/30',
    badge: 'Budget',
  },
  {
    id: 3,
    emoji: '🛵',
    type: 'Activa Scooter',
    desc: 'Easy rides for short distances & daily use. Smooth and comfortable for city traffic.',
    features: ['Easy Ride', 'Storage Space', 'City Perfect'],
    price: '₹280/day',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'hover:border-purple-500/30',
    badge: 'Best Seller',
  },
  {
    id: 4,
    emoji: '🚖',
    type: 'Taxi Service',
    desc: 'Reliable & professional drivers for any trip. Available round the clock.',
    features: ['With Driver', 'Airport Pickup', '24/7 Available'],
    price: '₹15/km',
    color: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'hover:border-orange-500/30',
    badge: '24/7',
  },
];

export default function FleetSection() {
  return (
    <section className="section py-24 relative" id="fleet">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-tag mx-auto"
          >
            🚗 Our Fleet
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4"
          >
            Choose Your <span className="gradient-text">Perfect Ride</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto"
          >
            From bikes to SUVs, we have the right vehicle for every journey and budget.
          </motion.p>
        </div>

        {/* Fleet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass card-glow rounded-2xl p-6 flex flex-col gap-4 border border-white/[0.07] ${vehicle.borderColor} transition-all duration-300 hover:-translate-y-2 hover:shadow-glow group cursor-pointer`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20">
                  {vehicle.badge}
                </span>
                <Star size={14} className="text-amber-400 fill-amber-400" />
              </div>

              {/* Emoji vehicle image */}
              <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${vehicle.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-6xl">{vehicle.emoji}</span>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-white font-bold text-lg">{vehicle.type}</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{vehicle.desc}</p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5">
                {vehicle.features.map((f) => (
                  <span key={f} className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {f}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <div>
                  <span className="text-orange-400 font-bold text-lg">{vehicle.price}</span>
                </div>
                <Link to="/booking" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-orange-500/20 hover:bg-orange-500 px-3 py-1.5 rounded-lg transition-all duration-300">
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
