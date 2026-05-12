import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Car, Bike, Zap, MapPin } from 'lucide-react';

const vehicleIcons = { Car: '🚗', Bike: '🏍️', Activa: '🛵', Taxi: '🚖' };

export default function HeroSection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', vehicleType: 'Car', city: 'Ahmedabad',
    pickupDate: '', returnDate: '',
  });

  const handleBook = (e) => {
    e.preventDefault();
    navigate('/booking', { state: form });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Ambient blobs */}
      <div className="blob blob-orange w-[700px] h-[700px] absolute -top-40 -right-40 animate-float" style={{ animationDelay: '0s' }} />
      <div className="blob blob-amber w-[500px] h-[500px] absolute -bottom-20 -left-40 animate-float" style={{ animationDelay: '3s' }} />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-glow" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="section-tag mb-6"
            >
              <Zap size={12} className="fill-orange-500" />
              Fast · Reliable · Affordable
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight"
            >
              Book{' '}
              <span className="gradient-text">Cars, Bikes</span>
              <br />
              <span className="text-white">&amp; Taxis</span>{' '}
              <span className="text-slate-300">with Ease</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Fast, reliable, and affordable rental services available 24/7.
              Your ride is just one click away!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link to="/booking" className="btn-primary text-base px-7 py-3.5">
                🚖 Book Now <ArrowRight size={18} />
              </Link>
              <Link to="/rentals" className="btn-ghost text-base px-7 py-3.5">
                <Play size={16} className="fill-white" /> View Services
              </Link>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              {[['10K+', 'Happy Customers'], ['500+', 'Vehicles'], ['50+', 'Cities']].map(([num, label]) => (
                <div key={label}>
                  <span className="block text-2xl font-black gradient-text">{num}</span>
                  <span className="text-slate-500 text-sm">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass card-glow rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-1">Quick Booking</h2>
              <p className="text-slate-400 text-sm mb-6">Fill details to confirm your ride instantly</p>

              <form onSubmit={handleBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Your Name</label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      className="input-field"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Contact Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="input-field"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Select Vehicle</label>
                    <select
                      className="input-field"
                      value={form.vehicleType}
                      onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    >
                      <option value="Car">🚗 Car</option>
                      <option value="Bike">🏍️ Bike</option>
                      <option value="Activa">🛵 Activa</option>
                      <option value="Taxi">🚖 Taxi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">City</label>
                    <select
                      className="input-field"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    >
                      <option>Ahmedabad</option>
                      <option>Surat</option>
                      <option>Vadodara</option>
                      <option>Rajkot</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Pickup Date & Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={form.pickupDate}
                      onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Return Date & Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={form.returnDate}
                      onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-base py-3.5 mt-2">
                  ✅ Confirm Booking
                </button>
              </form>

              {/* Floating vehicle type pills */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {Object.entries(vehicleIcons).map(([type, icon]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, vehicleType: type })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.vehicleType === type
                        ? 'bg-orange-500 text-white'
                        : 'glass text-slate-400 hover:text-white'
                    }`}
                  >
                    {icon} {type}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-900 to-transparent" />
    </section>
  );
}
