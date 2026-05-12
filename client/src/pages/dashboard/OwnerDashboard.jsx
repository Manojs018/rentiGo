import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Plus, List, BarChart2, Wrench, Home, LogOut, CheckCircle, XCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'fleet', label: 'My Fleet', icon: Car },
  { id: 'add', label: 'Add Vehicle', icon: Plus },
  { id: 'bookings', label: 'Bookings', icon: List },
  { id: 'revenue', label: 'Revenue', icon: BarChart2 },
];

const statusColors = { pending: 'text-yellow-400 bg-yellow-400/10', confirmed: 'text-blue-400 bg-blue-400/10', active: 'text-green-400 bg-green-400/10', completed: 'text-slate-400 bg-slate-400/10', cancelled: 'text-red-400 bg-red-400/10' };

const emptyVehicle = { vehicleNumber: '', brand: '', model: '', type: 'car', fuelType: 'petrol', transmission: 'manual', dailyPrice: '', weeklyPrice: '', monthlyPrice: '', city: 'ahmedabad', description: '', seats: '', year: '' };

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyVehicle);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([vehicleAPI.getMy(), bookingAPI.getOwner()]);
      setVehicles(vRes.data.data || []);
      setBookings(bRes.data.data || []);
    } catch {
      // Demo data
      setVehicles([
        { _id: '1', brand: 'Honda', model: 'Sedan', type: 'car', status: 'approved', isAvailable: true, dailyPrice: 2500, city: 'ahmedabad', totalBookings: 12, emoji: '🚗' },
        { _id: '2', brand: 'Honda', model: 'Activa 6G', type: 'activa', status: 'pending', isAvailable: false, dailyPrice: 450, city: 'surat', totalBookings: 5, emoji: '🛵' },
      ]);
      setBookings([
        { _id: '1', customer: { name: 'Arjun Patel', phone: '+91 9876543210' }, vehicle: { brand: 'Honda', model: 'Sedan', emoji: '🚗' }, status: 'confirmed', pickupDate: '2026-05-15', totalAmount: 4200 },
        { _id: '2', customer: { name: 'Priya Sharma', phone: '+91 8765432109' }, vehicle: { brand: 'Honda', model: 'Activa', emoji: '🛵' }, status: 'pending', pickupDate: '2026-05-18', totalAmount: 900 },
      ]);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleAPI.add(form);
      toast.success('Vehicle submitted for approval! 🎉');
      setForm(emptyVehicle);
      fetchData();
      setActiveTab('fleet');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status });
      toast.success(`Booking ${status}!`);
      fetchData();
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const totalRevenue = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
              <Car size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold"><span className="gradient-text">Renti</span><span className="text-white">Go</span></span>
          </Link>
          <p className="text-xs text-slate-500 mt-2">Owner Dashboard</p>
        </div>
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 glass rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center font-bold text-orange-400">{user?.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-orange-400 capitalize">Vehicle Owner</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={17} />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all"><Home size={17} />Back to Site</Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all"><LogOut size={17} />Sign Out</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden glass p-2 rounded-xl text-white text-xl">☰</button>
          <h1 className="text-lg font-bold text-white capitalize">{navItems.find(n => n.id === activeTab)?.label}</h1>
          <button onClick={() => setActiveTab('add')} className="btn-primary text-sm py-2 px-4"><Plus size={15} />Add Vehicle</button>
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Vehicles', value: vehicles.length, icon: '🚗', color: 'text-orange-400' },
                  { label: 'Active Bookings', value: bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length, icon: '📅', color: 'text-green-400' },
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-purple-400' },
                  { label: 'Pending Reviews', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass card-glow rounded-2xl p-5 border border-white/[0.07]">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="glass card-glow rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06]"><h3 className="text-white font-bold">Recent Booking Requests</h3></div>
                <div className="divide-y divide-white/[0.04]">
                  {bookings.slice(0, 4).map(b => (
                    <div key={b._id} className="p-5 flex items-center gap-4">
                      <div className="text-3xl">{b.vehicle?.emoji || '🚗'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{b.customer?.name}</p>
                        <p className="text-slate-400 text-xs">{b.vehicle?.brand} {b.vehicle?.model} • {new Date(b.pickupDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[b.status]}`}>{b.status}</span>
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"><CheckCircle size={16} /></button>
                            <button onClick={() => handleUpdateStatus(b._id, 'cancelled')} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><XCircle size={16} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Fleet */}
          {activeTab === 'fleet' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v, i) => (
                <motion.div key={v._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass card-glow rounded-2xl p-5 border border-white/[0.07] hover:border-orange-500/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{v.emoji || '🚗'}</span>
                    <div className="flex gap-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                        v.status === 'approved' ? 'text-green-400 bg-green-400/10' :
                        v.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>{v.status}</span>
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-1">{v.brand} {v.model}</h3>
                  <p className="text-slate-400 text-xs mb-3 capitalize">{v.type} • {v.city}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-400 font-bold">₹{v.dailyPrice?.toLocaleString()}/day</span>
                    <span className={`text-xs ${v.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                      {v.isAvailable ? '✓ Available' : '✗ Booked'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-slate-400 hover:text-white text-xs transition-all"><Edit2 size={13} />Edit</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs transition-all"><Trash2 size={13} />Remove</button>
                  </div>
                </motion.div>
              ))}
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveTab('add')}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/30 p-10 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-orange-400 transition-all">
                <Plus size={28} /><span className="text-sm font-medium">Add New Vehicle</span>
              </motion.button>
            </motion.div>
          )}

          {/* Add Vehicle */}
          {activeTab === 'add' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="glass card-glow rounded-2xl p-7 border border-white/[0.07]">
                <h2 className="text-xl font-bold text-white mb-6">Add New Vehicle</h2>
                <form onSubmit={handleAddVehicle} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Vehicle Number *</label><input className="input-field" placeholder="GJ01AB1234" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} required /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Brand *</label><input className="input-field" placeholder="Honda" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Model *</label><input className="input-field" placeholder="City" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Type *</label>
                      <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="car">Car</option><option value="bike">Bike</option><option value="activa">Activa</option><option value="taxi">Taxi</option><option value="suv">SUV</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Fuel Type</label>
                      <select className="input-field" value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })}>
                        <option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="electric">Electric</option><option value="cng">CNG</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Transmission</label>
                      <select className="input-field" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                        <option value="manual">Manual</option><option value="automatic">Automatic</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Daily Price (₹) *</label><input type="number" className="input-field" placeholder="1200" value={form.dailyPrice} onChange={e => setForm({ ...form, dailyPrice: e.target.value })} required /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Weekly Price (₹)</label><input type="number" className="input-field" placeholder="7000" value={form.weeklyPrice} onChange={e => setForm({ ...form, weeklyPrice: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">Monthly Price (₹)</label><input type="number" className="input-field" placeholder="20000" value={form.monthlyPrice} onChange={e => setForm({ ...form, monthlyPrice: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400 mb-1.5 block">City *</label>
                      <select className="input-field" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                        <option value="ahmedabad">Ahmedabad</option><option value="surat">Surat</option><option value="vadodara">Vadodara</option><option value="rajkot">Rajkot</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs text-slate-400 mb-1.5 block">Description</label><textarea className="input-field h-24 resize-none" placeholder="Describe your vehicle..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                    {loading ? 'Submitting...' : '🚗 Submit for Approval'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {bookings.map((b, i) => (
                <motion.div key={b._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass card-glow rounded-2xl p-5 border border-white/[0.07] hover:border-orange-500/20 transition-all">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="text-4xl">{b.vehicle?.emoji || '🚗'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h4 className="text-white font-bold">{b.customer?.name}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[b.status]}`}>{b.status}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{b.vehicle?.brand} {b.vehicle?.model} • {b.customer?.phone}</p>
                      <p className="text-slate-500 text-xs mt-1">Pickup: {new Date(b.pickupDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-black text-xl">₹{b.totalAmount?.toLocaleString()}</p>
                      {b.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-all"><CheckCircle size={13} />Approve</button>
                          <button onClick={() => handleUpdateStatus(b._id, 'cancelled')} className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><XCircle size={13} />Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Revenue */}
          {activeTab === 'revenue' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-orange-400' },
                  { label: 'This Month', value: `₹${Math.round(totalRevenue * 0.35).toLocaleString()}`, color: 'text-green-400' },
                  { label: 'Pending Payout', value: `₹${Math.round(totalRevenue * 0.1).toLocaleString()}`, color: 'text-yellow-400' },
                ].map(s => (
                  <div key={s.label} className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                    <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                <h3 className="text-white font-bold mb-4">Revenue by Vehicle</h3>
                <div className="space-y-3">
                  {vehicles.map(v => (
                    <div key={v._id} className="flex items-center gap-4">
                      <span className="text-2xl">{v.emoji || '🚗'}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{v.brand} {v.model}</p>
                        <div className="w-full bg-white/5 rounded-full h-2 mt-1.5">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full" style={{ width: `${Math.random() * 70 + 20}%` }} />
                        </div>
                      </div>
                      <span className="text-orange-400 font-semibold text-sm">₹{(v.totalBookings * v.dailyPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
