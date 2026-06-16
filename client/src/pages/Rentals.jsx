import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { vehicleAPI } from '../services/api';
import { Search, Filter, Fuel, Settings, MapPin, Star, Heart, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const vehicleIcons = {
  car: '🚗',
  suv: '🚙',
  bike: '🏍️',
  activa: '🛵',
  taxi: '🚖'
};

export default function Rentals() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    fuelType: '',
    transmission: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await vehicleAPI.getAll(filters);
      setVehicles(data.data || []);
    } catch (error) {
      // Mock data for demo
      const mockVehicles = [
        { _id: '1', name: 'Honda City', brand: 'Honda', model: 'City', type: 'car', dailyPrice: 2500, fuelType: 'Petrol', transmission: 'Manual', city: 'Ahmedabad', rating: 4.8, available: true, images: [] },
        { _id: '2', name: 'Hyundai Creta', brand: 'Hyundai', model: 'Creta', type: 'suv', dailyPrice: 3500, fuelType: 'Diesel', transmission: 'Automatic', city: 'Surat', rating: 4.9, available: true, images: [] },
        { _id: '3', name: 'Royal Enfield Classic', brand: 'Royal Enfield', model: 'Classic 350', type: 'bike', dailyPrice: 800, fuelType: 'Petrol', transmission: 'Manual', city: 'Ahmedabad', rating: 4.7, available: true, images: [] },
        { _id: '4', name: 'Honda Activa 6G', brand: 'Honda', model: 'Activa 6G', type: 'activa', dailyPrice: 450, fuelType: 'Petrol', transmission: 'Automatic', city: 'Vadodara', rating: 4.6, available: true, images: [] },
        { _id: '5', name: 'Toyota Innova', brand: 'Toyota', model: 'Innova', type: 'taxi', dailyPrice: 4000, fuelType: 'Diesel', transmission: 'Manual', city: 'Rajkot', rating: 4.8, available: true, images: [] },
        { _id: '6', name: 'Suzuki Swift', brand: 'Suzuki', model: 'Swift', type: 'car', dailyPrice: 1800, fuelType: 'Petrol', transmission: 'Manual', city: 'Surat', rating: 4.5, available: false, images: [] },
      ];
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-tag"
            >
              Explore Fleet
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black text-white mt-4"
            >
              Our Available <span className="gradient-text">Rentals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 mt-4 max-w-xl"
            >
              Browse through our premium collection of cars, bikes, and taxis. Use filters to find your perfect ride.
            </motion.p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-10 flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by brand, model or type..."
                className="input-field pl-12 h-14 bg-white/[0.03] border-white/10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-14 px-6 rounded-xl border transition-all ${
                showFilters ? 'bg-orange-500 border-orange-500 text-white shadow-glow-sm' : 'glass border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="font-semibold text-sm">Filters</span>
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-10"
              >
                <div className="glass rounded-2xl p-6 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Vehicle Type</label>
                    <select
                      className="input-field bg-dark-900/50"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="">All Types</option>
                      <option value="car">Cars</option>
                      <option value="suv">SUVs</option>
                      <option value="bike">Bikes</option>
                      <option value="activa">Scooters</option>
                      <option value="taxi">Taxis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">City</label>
                    <select
                      className="input-field bg-dark-900/50"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    >
                      <option value="">All Cities</option>
                      <option value="ahmedabad">Ahmedabad</option>
                      <option value="surat">Surat</option>
                      <option value="vadodara">Vadodara</option>
                      <option value="rajkot">Rajkot</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Fuel Type</label>
                    <select
                      className="input-field bg-dark-900/50"
                      value={filters.fuelType}
                      onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                    >
                      <option value="">Any Fuel</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="cng">CNG</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Transmission</label>
                    <select
                      className="input-field bg-dark-900/50"
                      value={filters.transmission}
                      onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                    >
                      <option value="">Any Transmission</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass rounded-2xl h-[400px] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <>
              {vehicles.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl border border-white/5">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Vehicles Found</h3>
                  <p className="text-slate-500 mb-8">Try adjusting your filters or search query.</p>
                  <button
                    onClick={() => setFilters({ type: '', city: '', fuelType: '', transmission: '', search: '' })}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((v, i) => (
                    <motion.div
                      key={v._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass card-glow rounded-2xl overflow-hidden border border-white/[0.07] hover:border-orange-500/20 hover:-translate-y-2 hover:shadow-glow transition-all duration-300 group"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-dark-600 to-dark-700 flex items-center justify-center">
                        <span className="text-8xl group-hover:scale-110 transition-transform duration-300">
                          {vehicleIcons[v.type] || '🚗'}
                        </span>
                        <button
                          onClick={() => toggleFav(v._id)}
                          className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center transition-all hover:scale-110"
                        >
                          <Heart size={18} className={favorites.includes(v._id) ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>
                        <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          v.available ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {v.available ? 'Available' : 'Booked'}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{v.brand} {v.model}</h3>
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                              <span className="text-amber-400 text-xs font-bold">{v.rating}</span>
                              <span className="text-slate-500 text-xs">(Verified)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-orange-500">₹{v.dailyPrice.toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-tighter">per day</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="glass rounded-xl p-2 text-center border-white/5">
                            <Fuel size={14} className="mx-auto mb-1 text-orange-400" />
                            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-tighter truncate">{v.fuelType}</span>
                          </div>
                          <div className="glass rounded-xl p-2 text-center border-white/5">
                            <Settings size={14} className="mx-auto mb-1 text-orange-400" />
                            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-tighter truncate">{v.transmission}</span>
                          </div>
                          <div className="glass rounded-xl p-2 text-center border-white/5">
                            <MapPin size={14} className="mx-auto mb-1 text-orange-400" />
                            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-tighter truncate">{v.city}</span>
                          </div>
                        </div>

                        <Link
                          to={v.available ? `/booking` : '#'}
                          state={v.available ? { vehicleId: v._id } : undefined}
                          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            v.available
                              ? 'btn-primary'
                              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                          }`}
                        >
                          {v.available ? (
                            <>Book This Ride <ArrowRight size={16} /></>
                          ) : (
                            'Currently Unavailable'
                          )}
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
