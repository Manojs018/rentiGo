import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { MapPin, Car, Bike, Navigation, ChevronRight, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const cities = [
  {
    name: 'Ahmedabad',
    image: 'https://images.unsplash.com/photo-1599933310631-01614f1747ba?q=80&w=800&auto=format&fit=crop',
    description: 'The commercial hub of Gujarat with ancient architecture and modern infrastructure.',
    vehicles: '120+',
    spots: ['Sabarmati Riverfront', 'Adalaj Stepwell', 'Kankaria Lake'],
    rating: 4.9,
  },
  {
    name: 'Surat',
    image: 'https://images.unsplash.com/photo-1620803457106-905c8f8b659d?q=80&w=800&auto=format&fit=crop',
    description: 'The Diamond City of India, known for its textile industry and vibrant food culture.',
    vehicles: '85+',
    spots: ['Dumas Beach', 'Dutch Garden', 'Surat Castle'],
    rating: 4.8,
  },
  {
    name: 'Vadodara',
    image: 'https://images.unsplash.com/photo-1601666601610-d023b0923053?q=80&w=800&auto=format&fit=crop',
    description: 'The cultural capital of Gujarat, home to the magnificent Lakshmi Vilas Palace.',
    vehicles: '60+',
    spots: ['Laxmi Vilas Palace', 'Sayaji Baug', 'Champaner-Pavagadh'],
    rating: 4.7,
  },
  {
    name: 'Rajkot',
    image: 'https://images.unsplash.com/photo-1632743817106-7e3f4e246876?q=80&w=800&auto=format&fit=crop',
    description: 'The center of Saurashtra region, blending industrial growth with rich heritage.',
    vehicles: '45+',
    spots: ['Watson Museum', 'Aji Dam', 'Iskcon Temple'],
    rating: 4.6,
  }
];

export default function Cities() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-tag mx-auto">Service Areas</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight">
              Rent Anywhere in <span className="gradient-text">Gujarat</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg">
              Explore our wide range of services across major cities. We're growing fast to bring RentiGo to every corner of the state.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {cities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass card-glow rounded-3xl overflow-hidden group border border-white/5 hover:border-orange-500/20 transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-glow-sm">
                        <MapPin size={20} />
                      </div>
                      <h2 className="text-3xl font-black text-white">{city.name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-amber-400 text-sm font-bold">{city.rating} Rating</span>
                      </div>
                      <span className="text-slate-300 text-sm font-medium bg-white/10 px-2 py-0.5 rounded-full">{city.vehicles} Available</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-3">About the City</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{city.description}</p>
                    <Link to="/rentals" className="btn-primary w-full justify-center py-3">
                      Browse Rentals in {city.name}
                    </Link>
                  </div>
                  <div className="glass rounded-2xl p-6 border-white/5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <Navigation size={14} className="text-orange-500" /> Top Destinations
                    </h3>
                    <ul className="space-y-3">
                      {city.spots.map(spot => (
                        <li key={spot} className="flex items-center gap-3 text-slate-300 text-sm">
                          <CheckCircle size={14} className="text-green-400 shrink-0" />
                          {spot}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Banner */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass card-glow rounded-3xl p-10 sm:p-16 border-orange-500/10 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Car size={120} className="text-orange-500" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Want to <span className="gradient-text">List Your Vehicle?</span></h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">If you live in any of these cities and own a car or bike, join our growing network of partners and start earning.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary px-8">Become a Partner</Link>
              <Link to="/about" className="btn-ghost px-8">Learn How It Works</Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
