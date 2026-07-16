import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { bookingAPI, vehicleAPI } from '../services/api';
import toast from 'react-hot-toast';
import DocumentOCRVerifier from '../components/ui/DocumentOCRVerifier';
import {
  Calendar,
  MapPin,
  Car,
  Clock,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Info,
  CheckCircle,
  ArrowLeft,
  User,
  Phone,
  Leaf
} from 'lucide-react';

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getDiscountPercent = (points) => {
    if (points >= 3000) return 15;
    if (points >= 1500) return 10;
    if (points >= 500) return 5;
    return 0;
  };

  const discountPercent = user ? getDiscountPercent(user.ecoPoints || 0) : 0;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [form, setForm] = useState({
    vehicleId: '',
    pickupDate: '',
    returnDate: '',
    city: 'Ahmedabad',
    rentalPlan: 'daily',
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const socket = useSocket();

  useEffect(() => {
    const targetCity = location.state?.city || form.city;
    fetchVehicles(targetCity);
    // If vehicleId passed from Rentals/VehiclesSection, pre-select and skip to step 2
    if (location.state?.vehicleId) {
      setForm(prev => ({ ...prev, ...location.state }));
      fetchSelectedVehicle(location.state.vehicleId, true);
    } else if (location.state) {
      setForm(prev => ({ ...prev, ...location.state }));
    }
  }, [location.state]);

  useEffect(() => {
    if (!socket) return;

    const handleAvailabilityChange = ({ vehicleId, isAvailable }) => {
      // Update vehicles list
      setVehicles(prev => prev.map(v => 
        v._id === vehicleId ? { ...v, isAvailable } : v
      ));

      // If user has selected this vehicle and it is no longer available, reset
      if (selectedVehicle?._id === vehicleId && !isAvailable) {
        toast.error('The selected vehicle has just been booked. Please choose another.');
        setSelectedVehicle(null);
        setStep(1);
      }
    };

    socket.on('vehicle:availability_changed', handleAvailabilityChange);

    return () => {
      socket.off('vehicle:availability_changed', handleAvailabilityChange);
    };
  }, [socket, selectedVehicle]);

  const fetchVehicles = async (cityToFetch) => {
    const activeCity = cityToFetch || form.city;
    try {
      const { data } = await vehicleAPI.getAll({ city: activeCity.toLowerCase() });
      setVehicles(data.data || []);
    } catch (error) {
      // Mock vehicles
      setVehicles([
        { _id: '1', brand: 'Honda', model: 'City', type: 'car', dailyPrice: 2500, emoji: '🚗', isAvailable: true },
        { _id: '2', brand: 'Honda', model: 'Activa', type: 'activa', dailyPrice: 450, emoji: '🛵', isAvailable: true },
        { _id: '3', brand: 'Royal Enfield', model: 'Classic', type: 'bike', dailyPrice: 800, emoji: '🏍️', isAvailable: true },
      ]);
    }
  };

  const fetchSelectedVehicle = async (id, autoAdvance = false) => {
    try {
      const { data } = await vehicleAPI.getOne(id);
      const vehicle = data.data;
      if (vehicle.status === 'In Maintenance') {
        toast.error('This vehicle is currently in maintenance and cannot be booked.');
        setSelectedVehicle(null);
        setStep(1);
        return;
      }
      setSelectedVehicle(vehicle);
      if (autoAdvance) setStep(2);
    } catch (error) {
      console.error('Could not pre-select vehicle:', error);
      // Still advance to step 1 so user can pick manually
    }
  };

  const handleCityChange = (newCity) => {
    setForm(prev => ({ ...prev, city: newCity }));
    fetchVehicles(newCity);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to complete your booking');
      navigate('/login', { state: { from: '/booking', bookingData: form } });
      return;
    }

    if (selectedVehicle?.status === 'In Maintenance') {
      toast.error('This vehicle is currently in maintenance and cannot be booked.');
      return;
    }

    if (!form.pickupDate || !form.returnDate || !selectedVehicle) {
      toast.error('Please fill all required details');
      return;
    }

    setLoading(true);
    try {
      await bookingAPI.create({
        vehicleId: selectedVehicle._id,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        city: form.city,
        rentalPlan: form.rentalPlan
      });
      setStep(5); // Success step
      toast.success('Booking confirmed! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateDurationDays = () => {
    if (!form.pickupDate || !form.returnDate) return 1;
    const start = new Date(form.pickupDate);
    const end = new Date(form.returnDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const calculateBase = () => {
    if (!selectedVehicle) return 0;
    const days = calculateDurationDays();
    return days * selectedVehicle.dailyPrice;
  };

  const calculateTotal = () => {
    const base = calculateBase();
    const discount = Math.round(base * (discountPercent / 100));
    const net = base - discount;
    const tax = Math.round(net * 0.18);
    return net + tax;
  };

  const getEcoMultiplier = (fuelType) => {
    switch (fuelType) {
      case 'electric': return 3.0;
      case 'cng': return 2.0;
      case 'hybrid': return 1.5;
      default: return 0.5;
    }
  };

  const getCo2SavedPerKm = (fuelType) => {
    switch (fuelType) {
      case 'electric': return 150;
      case 'cng': return 70;
      case 'hybrid': return 60;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/5 -z-10" />
              {[
                { n: 1, label: 'Select Vehicle' },
                { n: 2, label: 'Ride Details' },
                { n: 3, label: 'Verify Identity' },
                { n: 4, label: 'Confirm' },
                { n: 5, label: 'Finished' },
              ].map(s => (
                <div key={s.n} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= s.n ? 'bg-orange-500 border-orange-500 text-white shadow-glow-sm' : 'bg-dark-900 border-white/10 text-slate-500'
                    }`}>
                    {step > s.n ? <CheckCircle size={20} /> : s.n}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 ${step >= s.n ? 'text-orange-400' : 'text-slate-600'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Vehicle Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white">Choose Your <span className="gradient-text">Ride</span></h2>
                    <div className="flex gap-2">
                      {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'].map(c => (
                        <button
                          key={c}
                          onClick={() => handleCityChange(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${form.city === c ? 'bg-orange-500 text-white' : 'glass text-slate-500 border-white/5'
                            }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map(v => {
                      const isAvail = v.isAvailable !== false;
                      return (
                        <div
                          key={v._id}
                          onClick={() => {
                            if (v.status === 'In Maintenance') {
                              toast.error('This vehicle is currently in maintenance and cannot be booked.');
                              return;
                            }
                            if (!isAvail) {
                              toast.error('This vehicle is currently unavailable');
                              return;
                            }
                            setSelectedVehicle(v);
                            setStep(2);
                          }}
                          className={`glass card-glow rounded-3xl p-6 border transition-all group relative ${
                            isAvail 
                              ? 'border-white/5 hover:border-orange-500/30 cursor-pointer' 
                              : 'border-red-500/10 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className={`absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isAvail ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {isAvail ? '● Available' : '● Booked'}
                          </span>

                          <div className="h-40 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform mb-4">
                            {v.emoji || '🚗'}
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-white font-bold text-lg">{v.brand} {v.model}</h3>
                              <p className="text-slate-500 text-xs uppercase tracking-widest">{v.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-orange-400 font-black text-xl">₹{v.dailyPrice}</p>
                              <p className="text-slate-500 text-[10px]">PER DAY</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Date & Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid lg:grid-cols-2 gap-12"
                >
                  <div className="space-y-8">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold">
                      <ArrowLeft size={16} /> Back to Vehicles
                    </button>
                    <h2 className="text-3xl font-black text-white">Ride <span className="gradient-text">Details</span></h2>

                    <div className="glass rounded-3xl p-8 border-white/5 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Pickup Date</label>
                          <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                            <input
                              type="datetime-local"
                              className="input-field pl-12"
                              value={form.pickupDate}
                              onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Return Date</label>
                          <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                            <input
                              type="datetime-local"
                              className="input-field pl-12"
                              value={form.returnDate}
                              onChange={e => setForm({ ...form, returnDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Rental Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['daily', 'weekly', 'monthly'].map(p => (
                            <button
                              key={p}
                              onClick={() => setForm({ ...form, rentalPlan: p })}
                              className={`py-3 rounded-xl text-xs font-bold uppercase transition-all ${form.rentalPlan === p ? 'bg-orange-500 text-white shadow-glow-sm' : 'glass border-white/5 text-slate-400'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (user?.verificationStatus === 'verified') {
                            setStep(4);
                          } else {
                            setStep(3);
                          }
                        }}
                        disabled={!form.pickupDate || !form.returnDate}
                        className="btn-primary w-full py-4 justify-center"
                      >
                        {user?.verificationStatus === 'verified' ? 'Proceed to Confirm' : 'Proceed to Verify Identity'} <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="lg:pt-14">
                    <div className="glass card-glow rounded-3xl p-8 border-white/10 sticky top-32">
                      <h3 className="text-white font-bold text-lg mb-6">Booking Summary</h3>
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                        <div className="text-5xl">{selectedVehicle?.emoji || '🚗'}</div>
                        <div>
                          <h4 className="text-white font-bold">{selectedVehicle?.brand} {selectedVehicle?.model}</h4>
                          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">{selectedVehicle?.type}</p>
                          {selectedVehicle?.fuelType && (
                            <span className="inline-block bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 text-slate-300">
                              🍃 {selectedVehicle.fuelType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Pickup Location</span>
                          <span className="text-white font-bold">{form.city}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Base Fare</span>
                          <span className="text-white font-bold">₹{calculateBase().toLocaleString()}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-sm text-green-400">
                            <span>Loyalty Discount ({discountPercent}%)</span>
                            <span className="font-bold">-₹{Math.round(calculateBase() * (discountPercent / 100)).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">GST (18%)</span>
                          <span className="text-white font-bold">₹{Math.round((calculateBase() - Math.round(calculateBase() * (discountPercent / 100))) * 0.18).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Eco Friendly Badging and Calculator Preview */}
                      {selectedVehicle && ['electric', 'cng', 'hybrid'].includes(selectedVehicle.fuelType) && (
                        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 mb-6 flex gap-3 text-left">
                          <Leaf className="text-green-400 shrink-0 mt-0.5 animate-pulse" size={16} />
                          <div>
                            <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Green Choice Reward</p>
                            <p className="text-slate-300 text-[11px] mt-1 leading-normal">
                              This ride saves approx.{' '}
                              <span className="text-green-400 font-bold">
                                {Math.round((calculateDurationDays() * 120 * getCo2SavedPerKm(selectedVehicle.fuelType)) / 10) / 100} kg
                              </span>{' '}
                              CO₂ and earns{' '}
                              <span className="text-green-400 font-bold">
                                {Math.round(calculateDurationDays() * 120 * getEcoMultiplier(selectedVehicle.fuelType))}
                              </span>{' '}
                              Eco Points!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-center">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Estimated Total</p>
                        <p className="text-orange-500 font-black text-3xl">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Identity Verification */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="space-y-6">
                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold mb-4">
                      <ArrowLeft size={16} /> Back to Ride Details
                    </button>
                    
                    <DocumentOCRVerifier 
                      onVerificationSuccess={() => setStep(4)} 
                      onVerificationFailed={() => {}} 
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-white">Review & <span className="gradient-text">Book</span></h2>
                    <p className="text-slate-500 mt-2">Almost there! Verify your details before confirming.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="glass rounded-3xl p-8 border-white/5">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                        <User size={16} className="text-orange-500" /> Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Full Name</label>
                          <div className="text-white font-bold">{form.name || user?.name}</div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Phone Number</label>
                          <div className="text-white font-bold">{form.phone || user?.phone || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-3xl p-8 border-white/5">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" /> Trip Schedule
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange-500">
                              <MapPin size={14} />
                            </div>
                            <span className="text-slate-400">Pickup in {form.city}</span>
                          </div>
                          <span className="text-white font-bold">{new Date(form.pickupDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange-500">
                              <MapPin size={14} />
                            </div>
                            <span className="text-slate-400">Dropoff in {form.city}</span>
                          </div>
                          <span className="text-white font-bold">{new Date(form.returnDate).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass card-glow rounded-3xl p-8 border-orange-500/20 bg-orange-500/5">
                      <div className="space-y-4 mb-6 pb-6 border-b border-white/5 text-sm text-left">
                        <div className="flex justify-between">
                          <span className="text-slate-450">Rental Fare</span>
                          <span className="text-white font-bold">₹{calculateBase().toLocaleString()}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Loyalty Discount ({discountPercent}%)</span>
                            <span className="font-bold">-₹{Math.round(calculateBase() * (discountPercent / 100)).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-450">GST (18%)</span>
                          <span className="text-white font-bold">₹{Math.round((calculateBase() - Math.round(calculateBase() * (discountPercent / 100))) * 0.18).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Grand Total</p>
                          <p className="text-3xl font-black text-white">₹{calculateTotal().toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase mb-1">
                            <ShieldCheck size={12} /> Secure Booking
                          </div>
                          <p className="text-slate-500 text-xs">Inclusive of taxes & discounts</p>
                        </div>
                      </div>
                      <button
                        onClick={handleBooking}
                        disabled={loading}
                        className="btn-primary w-full py-4 justify-center text-lg"
                      >
                        {loading ? 'Confirming...' : 'Complete Booking'}
                      </button>
                    </div>

                    <button onClick={() => setStep(user?.verificationStatus === 'verified' ? 2 : 3)} className="w-full py-4 text-slate-500 hover:text-white transition-all text-sm font-bold">
                      Wait, let me change something
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 mx-auto mb-8 shadow-glow-sm">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4">Booking <span className="gradient-text">Confirmed!</span></h2>
                  <p className="text-slate-400 text-lg mb-10">Your ride has been successfully booked. You'll receive a confirmation SMS and email shortly with the vehicle owner details.</p>

                  <div className="glass rounded-3xl p-8 border-white/5 mb-10 text-left">
                    <h3 className="text-white font-bold mb-4">What's Next?</h3>
                    <ul className="space-y-4">
                      {[
                        'Owner will verify and approve your booking within 30 minutes.',
                        'Receive location details for pickup.',
                        'Present your Driving License at the time of pickup.',
                        'Enjoy your RentiGo ride!'
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-orange-500 shrink-0">{i + 1}</span>
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">View My Bookings</button>
                    <button onClick={() => navigate('/')} className="btn-ghost px-8">Back to Home</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
