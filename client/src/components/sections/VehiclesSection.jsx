import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Fuel, Settings, MapPin, Star } from 'lucide-react';

const vehicles = [
  { id: 1, name: 'Honda Sedan', type: 'car', emoji: '🚗', price: 2500, fuel: 'Petrol', transmission: 'Manual', city: 'Ahmedabad', rating: 4.8, reviews: 124, available: true },
  { id: 2, name: 'White Mahindra XUV', type: 'suv', emoji: '🚙', price: 2800, fuel: 'Diesel', transmission: 'Automatic', city: 'Surat', rating: 4.9, reviews: 89, available: true },
  { id: 3, name: 'Honda Activa 6G', type: 'activa', emoji: '🛵', price: 450, fuel: 'Petrol', transmission: 'Automatic', city: 'Vadodara', rating: 4.7, reviews: 210, available: true },
  { id: 4, name: 'Royal Enfield Classic', type: 'bike', emoji: '🏍️', price: 800, fuel: 'Petrol', transmission: 'Manual', city: 'Ahmedabad', rating: 4.6, reviews: 76, available: false },
  { id: 5, name: 'Toyota Innova Taxi', type: 'taxi', emoji: '🚖', price: 15, fuel: 'CNG', transmission: 'Manual', city: 'Rajkot', rating: 4.8, reviews: 156, available: true, perKm: true },
  { id: 6, name: 'Swift Dzire', type: 'car', emoji: '🚗', price: 1800, fuel: 'Petrol', transmission: 'Manual', city: 'Surat', rating: 4.5, reviews: 93, available: true },
];

export default function VehiclesSection() {
  const [favorites, setFavorites] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  const types = ['all', 'car', 'suv', 'bike', 'activa', 'taxi'];
  const filtered = selectedType === 'all' ? vehicles : vehicles.filter(v => v.type === selectedType);

  const toggleFav = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  return (
    <section className="section py-24" id="vehicles">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>🚘 Available Now</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Available <span className="gradient-text">Vehicles</span>
          </motion.h2>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                selectedType === type
                  ? 'bg-orange-500 text-white shadow-glow-sm'
                  : 'glass text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass card-glow rounded-2xl overflow-hidden border border-white/[0.07] hover:border-orange-500/20 hover:-translate-y-2 hover:shadow-glow transition-all duration-300 group"
            >
              {/* Vehicle visual */}
              <div className="relative h-40 bg-gradient-to-br from-dark-600 to-dark-700 flex items-center justify-center">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{v.emoji}</span>
                <button
                  onClick={() => toggleFav(v.id)}
                  className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center transition-all hover:scale-110"
                >
                  <Heart size={15} className={favorites.includes(v.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                </button>
                <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${v.available ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {v.available ? '✓ Available' : '✗ Booked'}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{v.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-amber-400 text-xs font-semibold">{v.rating}</span>
                      <span className="text-slate-500 text-xs">({v.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-400 font-black text-xl">₹{v.price.toLocaleString()}</span>
                    <span className="text-slate-500 text-xs block">{v.perKm ? '/km' : '/day'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><Fuel size={12} className="text-orange-400" />{v.fuel}</span>
                  <span className="flex items-center gap-1.5"><Settings size={12} className="text-orange-400" />{v.transmission}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-orange-400" />{v.city}</span>
                </div>

                <Link
                  to={v.available ? '/booking' : '#'}
                  state={v.available ? { vehicleId: v.id } : undefined}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 block ${
                    v.available
                      ? 'bg-orange-500/15 hover:bg-orange-500 border border-orange-500/30 hover:border-transparent text-orange-400 hover:text-white'
                      : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {v.available ? '🚗 Book Now' : 'Not Available'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/rentals" className="btn-ghost">View All Vehicles →</Link>
        </div>
      </div>
    </section>
  );
}
