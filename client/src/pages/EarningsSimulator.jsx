import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Car, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Coins, 
  Plus, 
  Minus,
  Percent
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const VEHICLE_TYPES = [
  { id: 'scooter', label: 'Scooter (Activa)', icon: '🛵', defaultRate: 280, color: 'from-yellow-500 to-amber-500' },
  { id: 'bike', label: 'Motorbike', icon: '🏍️', defaultRate: 300, color: 'from-orange-500 to-red-500' },
  { id: 'car', label: 'Sedan Car', icon: '🚗', defaultRate: 1200, color: 'from-blue-500 to-indigo-500' },
  { id: 'suv', label: 'Premium SUV', icon: '🚙', defaultRate: 2500, color: 'from-purple-500 to-pink-500' },
];

export default function EarningsSimulator() {
  const [selectedType, setSelectedType] = useState('car');
  const [customRate, setCustomRate] = useState(false);
  const [dailyRate, setDailyRate] = useState(1200);
  const [occupancyRate, setOccupancyRate] = useState(75); // 50% to 95%
  const [vehicleCount, setVehicleCount] = useState(1);
  const [activeChart, setActiveChart] = useState('cumulative'); // 'cumulative' or 'monthly_comparison'

  // Update daily rate when vehicle type changes (if not using custom rates)
  useEffect(() => {
    if (!customRate) {
      const vehicle = VEHICLE_TYPES.find(v => v.id === selectedType);
      if (vehicle) setDailyRate(vehicle.defaultRate);
    }
  }, [selectedType, customRate]);

  // Calculations
  const daysActivePerMonth = Math.round(30 * (occupancyRate / 100));
  const monthlyGross = dailyRate * daysActivePerMonth * vehicleCount;
  const platformCommission = Math.round(monthlyGross * 0.10); // 10%
  const taxGST = Math.round(monthlyGross * 0.18); // 18% GST
  const netMonthly = monthlyGross - platformCommission - taxGST;
  const netAnnual = netMonthly * 12;

  // Chart Data: Cumulative 12 Months
  const getCumulativeData = () => {
    let cumulative = 0;
    return Array.from({ length: 12 }, (_, i) => {
      cumulative += netMonthly;
      return {
        name: `Month ${i + 1}`,
        Earnings: cumulative,
      };
    });
  };

  // Chart Data: Gross vs Net comparison
  const getComparisonData = () => {
    return [
      { name: 'Gross Earnings', Amount: monthlyGross, fill: '#f97316' },
      { name: 'Platform Fee (10%)', Amount: platformCommission, fill: '#ef4444' },
      { name: 'GST Tax (18%)', Amount: taxGST, fill: '#a855f7' },
      { name: 'Your Net Payout', Amount: netMonthly, fill: '#22c55e' }
    ];
  };

  const handleIncrementVehicles = () => {
    if (vehicleCount < 10) setVehicleCount(prev => prev + 1);
  };

  const handleDecrementVehicles = () => {
    if (vehicleCount > 1) setVehicleCount(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />

      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="blob blob-orange w-[500px] h-[500px] absolute -top-40 -left-40 opacity-[0.06] pointer-events-none" />
        <div className="blob blob-amber w-[400px] h-[400px] absolute -bottom-20 -right-20 opacity-[0.05] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-14">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="section-tag mx-auto flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-orange-400" /> B2B Partner Tool
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black mt-4 mb-4 tracking-tight"
            >
              Calculate Your <span className="gradient-text">Earnings Potential</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Turn your idle cars, bikes, or scooters into steady passive income. Use our interactive calculator to see how much you can earn listing on RentiGo.
            </motion.p>
          </div>

          {/* Interactive Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Input Controls Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 glass p-6 sm:p-8 rounded-3xl border-white/5 space-y-6"
            >
              <h2 className="text-xl font-bold border-b border-white/[0.06] pb-4 flex items-center gap-2">
                <Coins size={20} className="text-orange-400" /> Simulator Controls
              </h2>

              {/* Vehicle Type Selector */}
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 block">
                  1. Select Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedType(v.id);
                        if (!customRate) setDailyRate(v.defaultRate);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        selectedType === v.id 
                          ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-amber-500/10 shadow-glow-sm' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{v.icon}</span>
                      <span className="text-sm font-bold block leading-tight">{v.label}</span>
                      <span className="text-xs text-slate-400 block mt-1">Preset: ₹{v.defaultRate}/day</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Mode Toggle & Custom Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    2. Daily Rental Price (₹)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-orange-400 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={customRate} 
                      onChange={(e) => setCustomRate(e.target.checked)} 
                      className="rounded border-white/10 bg-dark-800 text-orange-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                    />
                    Use Custom Price
                  </label>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    disabled={!customRate}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-8 pr-4 text-white text-lg font-black focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Occupancy Rate Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    3. Projected Occupancy Rate
                  </label>
                  <span className="text-lg font-black text-orange-400">{occupancyRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>50% (15 Days/mo)</span>
                  <span>75% (22 Days/mo)</span>
                  <span>95% (28 Days/mo)</span>
                </div>
              </div>

              {/* Vehicle Count Selector */}
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
                  4. Number of Vehicles to List
                </label>
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl justify-between">
                  <button 
                    onClick={handleDecrementVehicles}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-slate-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-black text-white">{vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}</span>
                  <button 
                    onClick={handleIncrementVehicles}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-slate-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Calculator Summary Info */}
              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
                <Info size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculations based on an average 30-day month. Platform fee is fixed at <span className="text-white font-bold">10% commission</span>. Standard <span className="text-white font-bold">18% Service GST</span> applies to all gross digital transactions.
                </p>
              </div>

            </motion.div>

            {/* Projections & Visualizations Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Earnings Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 w-9 h-9 rounded-full flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Projected Monthly Net Payout</p>
                  <h3 className="text-3xl sm:text-4xl font-black text-white">₹{netMonthly.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2">After 10% platform fee & 18% GST deductions</p>
                </div>

                <div className="glass p-6 rounded-3xl border-orange-500/10 relative overflow-hidden ring-1 ring-orange-500/20">
                  <div className="absolute top-4 right-4 text-orange-400 bg-orange-500/10 w-9 h-9 rounded-full flex items-center justify-center">
                    <Coins size={18} />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Projected Annual Net Payout</p>
                  <h3 className="text-3xl sm:text-4xl font-black gradient-text">₹{netAnnual.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2">Passive income from {vehicleCount} listed {vehicleCount === 1 ? 'vehicle' : 'vehicles'}</p>
                </div>
              </div>

              {/* Graph Container */}
              <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Earning Projections Over Time</h3>
                    <p className="text-xs text-slate-400">See your growth over the next 12 months</p>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-dark-900/60 border border-white/5 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setActiveChart('cumulative')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${activeChart === 'cumulative' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Cumulative Growth
                    </button>
                    <button
                      onClick={() => setActiveChart('monthly_comparison')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${activeChart === 'monthly_comparison' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Fee Breakdown
                    </button>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'cumulative' ? (
                      <AreaChart data={getCumulativeData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis 
                          stroke="rgba(255,255,255,0.4)" 
                          fontSize={11}
                          tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Cumulative Earnings']}
                        />
                        <Area type="monotone" dataKey="Earnings" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={getComparisonData()} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                          contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                        />
                        <Bar dataKey="Amount" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Financial Ledger */}
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">Projected Monthly Statement</h4>
                <div className="space-y-3 divide-y divide-white/[0.04] text-sm">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-slate-400">Total Booking Rental Days ({daysActivePerMonth} Days/Vehicle)</span>
                    <span className="text-white font-semibold">{daysActivePerMonth * vehicleCount} Days</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 pb-2">
                    <span className="text-slate-400">Gross Rental Earnings</span>
                    <span className="text-white font-semibold">₹{monthlyGross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 pb-2 text-red-400">
                    <span className="text-slate-400 flex items-center gap-1">Platform Commission Fee <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-bold">10%</span></span>
                    <span>- ₹{platformCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 pb-2 text-purple-400">
                    <span className="text-slate-400 flex items-center gap-1">Service Tax / GST <span className="bg-purple-500/10 px-2 py-0.5 rounded text-[10px] font-bold">18%</span></span>
                    <span>- ₹{taxGST.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 text-emerald-400 text-base font-bold">
                    <span>Net Owner Payout (Take Home)</span>
                    <span>₹{netMonthly.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Call To Action Card */}
              <div className="glass p-8 rounded-3xl border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to list your fleet?</h3>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Set up your account, verify your vehicles, and open your calendar. Start earning from next week!
                  </p>
                </div>
                <Link to="/register?role=owner" className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-3 shrink-0">
                  Register as Owner <ArrowRight size={16} />
                </Link>
              </div>

            </motion.div>

          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-white mb-10">Frequently Asked Partner Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl border-white/5">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-orange-400 shrink-0" />
                  Is my vehicle insured during trips?
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Yes, RentiGo provides comprehensive insurance coverages for all active passenger rentals on our platform. In case of damages during bookings, repairs are handled by our insurance network with zero liability to owners.
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border-white/5">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-orange-400 shrink-0" />
                  When do I get my payouts?
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All digital customer payments are processed and cleared directly to your registered bank account bi-weekly (on the 15th and 30th of every calendar month) without delays.
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border-white/5">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Coins size={18} className="text-orange-400 shrink-0" />
                  How is daily pricing controlled?
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  While we recommend pricing ranges depending on vehicle engine size and type, you maintain absolute control over daily, weekly, and monthly listings pricing from your Owner Dashboard panel.
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border-white/5">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Info size={18} className="text-orange-400 shrink-0" />
                  Can I use my vehicle for personal needs?
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Absolutely. You can mark specific calendar dates as unavailable or block bookings inside your Owner Dashboard at any time when you need the vehicle for personal commutes.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
