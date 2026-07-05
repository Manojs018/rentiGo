import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Calendar, Heart, User, Bell, CreditCard, Clock, CheckCircle, XCircle, LogOut, Home, Leaf, Trophy, Award, Trees, Sparkles, Gift, ArrowRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, authAPI, notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import HandoverChatCoordinator from '../../components/ui/HandoverChatCoordinator';

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  active: 'text-green-400 bg-green-400/10 border-green-400/20',
  completed: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const getTierDetails = (points = 0) => {
  if (points >= 3000) return { name: 'Platinum Earth-Guardian', discount: 15, currentMin: 3000, nextMin: null, color: 'from-blue-500 to-indigo-600', text: 'text-indigo-400' };
  if (points >= 1500) return { name: 'Gold Eco-Hero', discount: 10, currentMin: 1500, nextMin: 3000, color: 'from-amber-500 to-orange-600', text: 'text-orange-400' };
  if (points >= 500) return { name: 'Silver Eco-Explorer', discount: 5, currentMin: 500, nextMin: 1500, color: 'from-slate-400 to-slate-500', text: 'text-slate-400' };
  return { name: 'Bronze Rider', discount: 0, currentMin: 0, nextMin: 500, color: 'from-orange-800 to-amber-900', text: 'text-amber-700' };
};

function EcoCalculatorWidget() {
  const [distance, setDistance] = useState(250);
  const [vehicleFactor, setVehicleFactor] = useState(1.0); // Car
  const [fuelType, setFuelType] = useState('electric');

  const getMultiplier = () => {
    switch (fuelType) {
      case 'electric': return 3.0;
      case 'cng': return 2.0;
      case 'hybrid': return 1.5;
      case 'petrol': return 0.5;
      case 'diesel': return 0.1;
      default: return 0.5;
    }
  };

  const getCo2Offset = () => {
    switch (fuelType) {
      case 'electric': return 150;
      case 'cng': return 70;
      case 'hybrid': return 60;
      default: return 0;
    }
  };

  const points = Math.round(distance * getMultiplier() * vehicleFactor);
  const co2Saved = Math.round((distance * getCo2Offset() * vehicleFactor) / 10) / 100; // in kg
  const treesPlanted = Math.round((co2Saved / 20) * 100) / 100;

  return (
    <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between h-full text-left">
      <div>
        <h3 className="text-white font-bold flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
          <Sparkles size={18} className="text-amber-400" /> Trip Impact Simulator
        </h3>
        <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
          Simulate a rental trip and see how choosing a cleaner fuel type boosts your points and offsets emissions!
        </p>

        <div className="space-y-5">
          {/* Distance Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Estimated Trip Distance</span>
              <span className="text-orange-400 font-bold">{distance} km</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="2000" 
              step="10" 
              value={distance} 
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full accent-orange-500 bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
          </div>

          {/* Vehicle Type selector */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">Vehicle Type</label>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              {[
                { label: 'Scooter', val: 0.4, emoji: '🛵' },
                { label: 'Bike', val: 0.6, emoji: '🏍️' },
                { label: 'Car', val: 1.0, emoji: '🚗' },
                { label: 'SUV', val: 1.3, emoji: '🚙' }
              ].map((v) => (
                <button
                  key={v.label}
                  onClick={() => setVehicleFactor(v.val)}
                  className={`py-2 rounded-xl font-medium transition-all ${
                    vehicleFactor === v.val ? 'bg-orange-500/15 border border-orange-500/35 text-orange-400 font-bold' : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="text-base mb-0.5">{v.emoji}</div>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type selection */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">Fuel Type</label>
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              {[
                { label: 'Electric', val: 'electric' },
                { label: 'CNG', val: 'cng' },
                { label: 'Hybrid', val: 'hybrid' },
                { label: 'Petrol', val: 'petrol' },
                { label: 'Diesel', val: 'diesel' }
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={() => setFuelType(f.val)}
                  className={`py-2 rounded-xl font-bold uppercase transition-all ${
                    fuelType === f.val ? 'bg-green-500/15 border border-green-500/35 text-green-400' : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/[0.02]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Results */}
      <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-2 bg-white/[0.01] p-3.5 rounded-xl border border-white/[0.03]">
        <div className="text-center">
          <span className="text-[9px] uppercase text-slate-500 block">Saved CO₂</span>
          <span className="text-xs font-black text-green-400 mt-1 block">{co2Saved} kg</span>
        </div>
        <div className="text-center border-x border-white/5">
          <span className="text-[9px] uppercase text-slate-500 block">Eco Points</span>
          <span className="text-xs font-black text-orange-400 mt-1 block">+{points}</span>
        </div>
        <div className="text-center">
          <span className="text-[9px] uppercase text-slate-500 block">Trees Growth</span>
          <span className="text-xs font-black text-emerald-400 mt-1 block">+{treesPlanted}</span>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'rewards', label: 'Eco Rewards', icon: Leaf },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function CustomerDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMy();
      setBookings(data.data || []);
    } catch {
      // Demo data if not connected
      setBookings([
        { _id: '1', vehicle: { brand: 'Honda', model: 'Sedan', type: 'car', emoji: '🚗' }, status: 'confirmed', pickupDate: '2026-05-15', returnDate: '2026-05-18', totalAmount: 4200, city: 'Ahmedabad', rentalPlan: 'daily' },
        { _id: '2', vehicle: { brand: 'Honda', model: 'Activa 6G', type: 'activa', emoji: '🛵' }, status: 'completed', pickupDate: '2026-04-10', returnDate: '2026-04-12', totalAmount: 900, city: 'Surat', rentalPlan: 'daily' },
        { _id: '3', vehicle: { brand: 'Royal Enfield', model: 'Classic 350', type: 'bike', emoji: '🏍️' }, status: 'cancelled', pickupDate: '2026-03-20', returnDate: '2026-03-22', totalAmount: 1600, city: 'Vadodara', rentalPlan: 'daily' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const { data } = await authAPI.getFavorites();
      setFavorites(data.data || []);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleRemoveFavorite = async (vehicleId) => {
    try {
      await authAPI.toggleFavorite(vehicleId);
      setFavorites(prev => prev.filter(v => v._id !== vehicleId));
      toast.success('Removed from favorites');
    } catch {
      toast.error('Failed to remove from favorites');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-orange-400' },
    { label: 'Active Rentals', value: bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length, icon: Car, color: 'text-green-400' },
    { label: 'Completed Trips', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'text-blue-400' },
    { label: 'Total Spent', value: `₹${bookings.reduce((s, b) => s + (b.totalAmount || 0), 0).toLocaleString()}`, icon: CreditCard, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
              <Car size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold"><span className="gradient-text">Renti</span><span className="text-white">Go</span></span>
          </Link>
          <p className="text-xs text-slate-500 mt-2">Customer Dashboard</p>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 glass rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-lg font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
            <Home size={17} /> Back to Site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden glass p-2 rounded-xl text-white">
            <span className="text-xl">☰</span>
          </button>
          <h1 className="text-lg font-bold text-white capitalize">{navItems.find(n => n.id === activeTab)?.label}</h1>
          <Link to="/booking" className="btn-primary text-sm py-2 px-4">🚖 New Booking</Link>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Welcome */}
              <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                  <p className="text-slate-400 text-sm">Ready for your next ride?</p>
                </div>
                {user?.ecoPoints > 0 && (
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Leaf size={16} className="text-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">
                      {user.ecoPoints} Eco Points Active
                    </span>
                  </div>
                )}
              </div>

              {/* Green Footprint Banner */}
              {user?.ecoPoints > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="glass border-green-500/20 bg-gradient-to-r from-green-950/20 to-emerald-950/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-glow-sm shrink-0">
                      <Trees size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Your Green Footprint is Growing! 🍃</h3>
                      <p className="text-slate-400 text-sm mt-1">You've saved <span className="text-green-400 font-bold">{user.co2Offset || 0} kg</span> of CO₂ emissions and grown <span className="text-green-400 font-bold">{user.treesPlanted || 0} equivalent trees</span>.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('rewards')} className="btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/20 text-xs py-2.5 px-5 flex items-center gap-2 shrink-0">
                    Open Eco Dashboard <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass card-glow rounded-2xl p-5 border border-white/[0.07]">
                    <stat.icon size={20} className={`${stat.color} mb-3`} />
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Recent bookings */}
              <div className="glass card-glow rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-white font-bold">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-orange-400 text-sm hover:text-orange-300">View all →</button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {bookings.slice(0, 3).map(b => (
                    <div key={b._id} className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="text-3xl">{b.vehicle?.emoji || '🚗'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{b.vehicle?.brand} {b.vehicle?.model}</p>
                        <p className="text-slate-500 text-xs">{b.city} • {b.rentalPlan}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[b.status]}`}>{b.status}</span>
                        <p className="text-orange-400 text-sm font-bold mt-1">₹{b.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No bookings yet. <Link to="/booking" className="text-orange-400">Book your first ride!</Link></div>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Eco Rewards Tab */}
          {activeTab === 'rewards' && (() => {
            const tier = getTierDetails(user?.ecoPoints || 0);
            const progressPercent = tier.nextMin 
              ? Math.min(100, Math.max(0, ((user?.ecoPoints || 0) - tier.currentMin) / (tier.nextMin - tier.currentMin) * 100))
              : 100;
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Header */}
                <div className="glass card-glow rounded-2xl p-6 border-white/[0.07] bg-gradient-to-r from-green-950/20 to-emerald-950/10 text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Leaf className="text-green-400 animate-bounce" size={24} /> Green Impact & <span className="gradient-text">Rewards</span>
                      </h2>
                      <p className="text-slate-400 text-sm mt-1">Unlock benefits and discounts by choosing eco-friendly electric, CNG, or hybrid rides.</p>
                    </div>
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl shrink-0 text-left">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Current Tier</span>
                      <span className="text-green-400 font-extrabold text-sm capitalize">{tier.name}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {[
                    { label: 'Eco Points', value: user?.ecoPoints || 0, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
                    { label: 'CO₂ Saved', value: `${user?.co2Offset || 0} kg`, icon: Leaf, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
                    { label: 'Equivalent Trees', value: user?.treesPlanted || 0, icon: Trees, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
                    { label: 'Active Discount', value: `${tier.discount}% Off`, icon: Gift, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' }
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-5 border border-white/[0.07] flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} shrink-0`}>
                        <stat.icon size={20} className={stat.color} />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Milestones Progress Card */}
                <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2"><Award size={18} className="text-orange-500" /> Milestone Progress</h3>
                    <span className="text-xs text-slate-400">{user?.ecoPoints || 0} total points</span>
                  </div>

                  <div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progressPercent}%` }} 
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                      />
                    </div>
                    
                    {tier.nextMin ? (
                      <div className="flex justify-between items-center text-xs mt-3">
                        <span className="text-slate-400">Current: <strong className="text-white">{tier.name}</strong></span>
                        <span className="text-orange-400 font-bold">
                          {tier.nextMin - (user?.ecoPoints || 0)} pts to next tier ({tier.nextMin} pts)
                        </span>
                        <span className="text-slate-450">Discount: <strong className="text-white">{tier.discount}% → Next: {tier.discount + 5}%</strong></span>
                      </div>
                    ) : (
                      <div className="text-xs text-green-400 font-bold mt-3 text-center">
                        🏆 Maximum level unlocked! You are a Platinum Earth-Guardian!
                      </div>
                    )}
                  </div>
                </div>

                {/* Garden Grid and Calculator Column */}
                <div className="grid lg:grid-cols-2 gap-6 text-left">
                  {/* Forest Tree Counter */}
                  <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                        <h3 className="text-white font-bold flex items-center gap-2"><Trees size={18} className="text-emerald-400" /> RentiGo Virtual Forest</h3>
                        <span className="text-xs px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                          {user?.treesPlanted || 0} Trees Grown
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        For every 20 kg of carbon emissions saved compared to petrol, we grow another tree in your virtual garden. Let's see your forest!
                      </p>

                      {/* Virtual Garden Field */}
                      <div className="p-5 bg-gradient-to-b from-green-950/20 to-emerald-950/20 rounded-2xl border border-emerald-500/10 min-h-[220px] flex items-center justify-center">
                        {(user?.treesPlanted || 0) > 0 ? (
                          <div className="grid grid-cols-5 gap-6 justify-center w-full">
                            {Array.from({ length: Math.floor(user?.treesPlanted || 0) }).map((_, i) => (
                              <motion.div 
                                key={`full-${i}`}
                                whileHover={{ scale: 1.25, rotate: [0, -7, 7, 0] }}
                                className="text-4xl text-center cursor-pointer select-none filter drop-shadow-md"
                                title={`Grown tree #${i+1}`}
                              >
                                🌲
                              </motion.div>
                            ))}
                            {(user?.treesPlanted || 0) % 1 >= 0.1 && (
                              <motion.div 
                                whileHover={{ scale: 1.25, rotate: [0, -7, 7, 0] }}
                                className="text-3xl text-center cursor-pointer select-none"
                                title="Sapling growing!"
                              >
                                🌱
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="text-4xl mb-3">🍂</div>
                            <p className="text-sm text-slate-500 font-medium">Your garden is empty</p>
                            <p className="text-xs text-slate-500 mt-1">Book an Electric, CNG, or Hybrid vehicle to plant your first tree!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-4 text-center">
                      🌿 Grow a real forest! A percentage of RentiGo profits are donated to reforestation projects.
                    </div>
                  </div>

                  {/* Eco Impact Calculator */}
                  <EcoCalculatorWidget />
                </div>

                {/* Loyalty Benefits Table */}
                <div className="glass rounded-2xl p-6 border border-white/[0.07] text-left">
                  <h3 className="text-white font-bold flex items-center gap-2 mb-6"><Trophy size={18} className="text-indigo-400" /> Tier Benefits & Loyalty System</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="text-xs uppercase text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="py-3 px-4">Tier</th>
                          <th className="py-3 px-4">Points Required</th>
                          <th className="py-3 px-4">Discount Applied</th>
                          <th className="py-3 px-4">Additional Perks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { name: 'Bronze Rider', req: '0 - 499', discount: '0%', perks: 'Standard access, daily deals', active: (user?.ecoPoints || 0) < 500 },
                          { name: 'Silver Eco-Explorer', req: '500 - 1,499', discount: '5%', perks: '5% off all cars, eco badges', active: (user?.ecoPoints || 0) >= 500 && (user?.ecoPoints || 0) < 1500 },
                          { name: 'Gold Eco-Hero', req: '1,500 - 2,999', discount: '10%', perks: '10% off all cars, free roadside assistance', active: (user?.ecoPoints || 0) >= 1500 && (user?.ecoPoints || 0) < 3000 },
                          { name: 'Platinum Earth-Guardian', req: '3,000+', discount: '15%', perks: '15% off all bookings, priority support & car swaps', active: (user?.ecoPoints || 0) >= 3000 }
                        ].map((t) => (
                          <tr key={t.name} className={`hover:bg-white/[0.02] transition-colors ${t.active ? 'bg-green-500/5 text-green-300 font-semibold' : ''}`}>
                            <td className="py-3.5 px-4 flex items-center gap-2">
                              {t.active && <Sparkles size={14} className="text-green-400 shrink-0" />}
                              {t.name}
                            </td>
                            <td className="py-3.5 px-4">{t.req}</td>
                            <td className="py-3.5 px-4 text-white font-bold">{t.discount}</td>
                            <td className="py-3.5 px-4 text-xs">{t.perks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : bookings.length === 0 ? (
                <div className="glass card-glow rounded-2xl p-12 text-center border border-white/[0.07]">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-white font-bold text-lg mb-2">No Bookings Yet</h3>
                  <p className="text-slate-400 text-sm mb-6">Start your journey with RentiGo today!</p>
                  <Link to="/booking" className="btn-primary">🚖 Book Now</Link>
                </div>
              ) : (
                bookings.map((b, i) => (
                  <motion.div key={b._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass card-glow rounded-2xl p-5 border border-white/[0.07] hover:border-orange-500/20 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{b.vehicle?.emoji || '🚗'}</div>
                        <div>
                          <h4 className="text-white font-bold">{b.vehicle?.brand} {b.vehicle?.model}</h4>
                          <p className="text-slate-400 text-sm mt-1">📍 {b.city} • {b.rentalPlan} plan</p>
                          <p className="text-slate-500 text-xs mt-1">
                            {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[b.status]}`}>{b.status}</span>
                        <p className="text-orange-400 font-black text-lg mt-2">₹{b.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                    {['confirmed', 'active', 'completed'].includes(b.status) && (
                      <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-end">
                        <button 
                          onClick={() => setSelectedBookingForChat(b)} 
                          className="flex items-center gap-2 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl transition-all border border-orange-500/20"
                        >
                          <MessageSquare size={14} />
                          Chat & Handover Coordinator
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
              <div className="glass card-glow rounded-2xl p-7 border border-white/[0.07]">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-black shadow-glow">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{user?.name}</h3>
                    <p className="text-slate-400 text-sm">{user?.role} account</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: user?.name, key: 'name' },
                    { label: 'Email Address', value: user?.email, key: 'email' },
                    { label: 'Phone Number', value: user?.phone || 'Not set', key: 'phone' },
                    { label: 'City', value: user?.city || 'Not set', key: 'city' },
                  ].map(field => (
                    <div key={field.key} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                      <span className="text-slate-400 text-sm">{field.label}</span>
                      <span className="text-white text-sm font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {favoritesLoading ? (
                <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : favorites.length === 0 ? (
                <div className="glass card-glow rounded-2xl p-12 text-center border border-white/[0.07]">
                  <div className="text-5xl mb-4">❤️</div>
                  <h3 className="text-white font-bold text-lg mb-2">Your Favorites</h3>
                  <p className="text-slate-400 text-sm mb-6">No favorites yet. Start exploring vehicles!</p>
                  <Link to="/rentals" className="btn-primary inline-flex">Browse Vehicles</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(v => (
                    <motion.div key={v._id} layout
                      className="glass card-glow rounded-2xl overflow-hidden border border-white/[0.07] hover:border-orange-500/20 transition-all duration-300 relative group">
                      <div className="relative h-40 bg-gradient-to-br from-dark-600 to-dark-700 flex items-center justify-center">
                        <span className="text-7xl group-hover:scale-105 transition-transform duration-300">
                          {v.type === 'car' ? '🚗' : v.type === 'suv' ? '🚙' : v.type === 'bike' ? '🏍️' : v.type === 'activa' ? '🛵' : '🚖'}
                        </span>
                        <button onClick={() => handleRemoveFavorite(v._id)}
                          className="absolute top-4 right-4 w-9 h-9 glass rounded-full flex items-center justify-center hover:scale-105 text-red-500 transition-all">
                          <Heart size={16} className="fill-red-500" />
                        </button>
                        <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          v.isAvailable ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {v.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-white font-bold text-base truncate">{v.brand} {v.model}</h4>
                            <p className="text-slate-500 text-xs mt-1 capitalize">{v.type} • {v.city}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-orange-500 font-extrabold text-lg">₹{v.dailyPrice?.toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px] block font-bold uppercase">per day</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to="/rentals" className="flex-1 py-2 text-center text-xs font-semibold glass text-slate-400 hover:text-white rounded-xl transition-all">View Details</Link>
                          <Link to={v.isAvailable ? "/booking" : "#"} state={v.isAvailable ? { vehicleId: v._id } : undefined}
                            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all ${
                              v.isAvailable ? 'btn-primary' : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                            }`}>
                            {v.isAvailable ? 'Book Now' : 'Unavailable'}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">
                        {notifications.filter(n => !n.isRead).length} unread notifications
                      </span>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                      <button onClick={handleMarkAllRead} className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {notifications.map(n => {
                      const Icon = n.type === 'booking' ? Calendar : n.type === 'approval' ? CheckCircle : Bell;
                      const iconColor = n.type === 'booking' ? 'text-blue-400' : n.type === 'approval' ? 'text-green-400' : 'text-amber-400';
                      return (
                        <div key={n._id} className={`glass p-4 rounded-xl border transition-all flex items-start gap-4 ${
                          n.isRead ? 'border-white/[0.04] opacity-75' : 'border-orange-500/10 shadow-glow-sm bg-orange-500/[0.02]'
                        }`}>
                          <div className={`p-2 rounded-lg bg-white/[0.04] mt-0.5 ${iconColor}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className={`text-sm font-bold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</h4>
                              <span className="text-slate-500 text-[10px] whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button onClick={() => handleMarkAsRead(n._id)}
                              className="text-orange-400 hover:text-orange-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-500/10 transition-all self-center">
                              Mark Read
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {notifications.length === 0 && (
                      <div className="glass card-glow rounded-2xl p-12 text-center border border-white/[0.07]">
                        <div className="text-5xl mb-4">🔔</div>
                        <h3 className="text-white font-bold text-lg mb-2">All Caught Up!</h3>
                        <p className="text-slate-400 text-sm">No notifications yet. We'll update you when there's news.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {selectedBookingForChat && (
          <HandoverChatCoordinator
            booking={selectedBookingForChat}
            currentUser={{ id: user?._id || user?.id, role: user?.role, name: user?.name }}
            onClose={() => setSelectedBookingForChat(null)}
            onBookingUpdated={(updatedBooking) => {
              setBookings((prev) => 
                prev.map((b) => b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b)
              );
              setSelectedBookingForChat(updatedBooking);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

