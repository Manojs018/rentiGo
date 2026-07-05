import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Plus, List, BarChart2, Wrench, Home, LogOut, CheckCircle, XCircle, Clock, Edit2, Trash2, Battery, AlertTriangle, Activity, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { vehicleAPI, bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import HandoverChatCoordinator from '../../components/ui/HandoverChatCoordinator';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'fleet', label: 'My Fleet', icon: Car },
  { id: 'diagnostics', label: 'Diagnostics & Health', icon: Wrench },
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
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [removingVehicle, setRemovingVehicle] = useState(null);

  // Diagnostics Tab States
  const [selectedDiagVehicleId, setSelectedDiagVehicleId] = useState(null);
  const [diagForm, setDiagForm] = useState({ tirePressure: 32, batteryCharge: 100, fuelLevel: 100, nextService: '' });
  const [newLog, setNewLog] = useState({ serviceType: 'Oil Change', date: new Date().toISOString().split('T')[0], notes: '' });
  const [diagSaving, setDiagSaving] = useState(false);
  const socket = useSocket();

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAvailabilityChange = ({ vehicleId, isAvailable }) => {
      setVehicles(prev => prev.map(v => 
        v._id === vehicleId ? { ...v, isAvailable } : v
      ));
    };

    socket.on('vehicle:availability_changed', handleAvailabilityChange);

    return () => {
      socket.off('vehicle:availability_changed', handleAvailabilityChange);
    };
  }, [socket]);

  const handleToggleAvailability = async (id, currentVal) => {
    const newVal = !currentVal;
    try {
      // Optimistic update
      setVehicles(prev => prev.map(v => 
        v._id === id ? { ...v, isAvailable: newVal } : v
      ));
      
      await vehicleAPI.toggleAvailability(id, newVal);
      toast.success(newVal ? 'Vehicle is now available for booking! 🟢' : 'Vehicle set to unavailable. 🔴');
    } catch (err) {
      // Revert
      setVehicles(prev => prev.map(v => 
        v._id === id ? { ...v, isAvailable: currentVal } : v
      ));
      toast.error('Failed to update availability status.');
    }
  };

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([vehicleAPI.getMy(), bookingAPI.getOwner()]);
      const myVehicles = vRes.data.data || [];
      setVehicles(myVehicles);
      setBookings(bRes.data.data || []);
      if (myVehicles.length > 0 && !selectedDiagVehicleId) {
        setSelectedDiagVehicleId(myVehicles[0]._id);
      }
    } catch {
      // Demo data
      const demoVehicles = [
        { _id: '1', brand: 'Honda', model: 'City', type: 'car', status: 'approved', isAvailable: true, dailyPrice: 2500, city: 'ahmedabad', totalBookings: 12, emoji: '🚗', tirePressure: 32, batteryCharge: 95, fuelLevel: 80, nextService: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), serviceLogs: [{ serviceType: 'Oil Change', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Replaced engine oil and filter.' }] },
        { _id: '2', brand: 'Honda', model: 'Activa 6G', type: 'activa', status: 'pending', isAvailable: false, dailyPrice: 450, city: 'surat', totalBookings: 5, emoji: '🛵', tirePressure: 30, batteryCharge: 92, fuelLevel: 70, nextService: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), serviceLogs: [{ serviceType: 'General Maintenance', date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Chain lubricated.' }] },
      ];
      setVehicles(demoVehicles);
      setBookings([
        { _id: '1', customer: { name: 'Arjun Patel', phone: '+91 9876543210' }, vehicle: { brand: 'Honda', model: 'Sedan', emoji: '🚗' }, status: 'confirmed', pickupDate: '2026-05-15', totalAmount: 4200 },
        { _id: '2', customer: { name: 'Priya Sharma', phone: '+91 8765432109' }, vehicle: { brand: 'Honda', model: 'Activa', emoji: '🛵' }, status: 'pending', pickupDate: '2026-05-18', totalAmount: 900 },
      ]);
      if (demoVehicles.length > 0 && !selectedDiagVehicleId) {
        setSelectedDiagVehicleId(demoVehicles[0]._id);
      }
    }
  };

  useEffect(() => {
    if (!selectedDiagVehicleId) return;
    const selectedVehicle = vehicles.find(v => v._id === selectedDiagVehicleId);
    if (selectedVehicle) {
      setDiagForm({
        tirePressure: selectedVehicle.tirePressure ?? 32,
        batteryCharge: selectedVehicle.batteryCharge ?? 100,
        fuelLevel: selectedVehicle.fuelLevel ?? 100,
        nextService: selectedVehicle.nextService ? new Date(selectedVehicle.nextService).toISOString().split('T')[0] : ''
      });
    }
  }, [selectedDiagVehicleId, vehicles]);

  const handleToggleMaintenance = async (vehicleId, currentStatus) => {
    const isMaintenance = currentStatus === 'In Maintenance';
    const newStatus = isMaintenance ? 'approved' : 'In Maintenance';
    const isAvailable = isMaintenance ? true : false;
    setLoading(true);
    try {
      await vehicleAPI.update(vehicleId, { status: newStatus, isAvailable });
      toast.success(isMaintenance ? 'Vehicle marked as approved and ready for rental! 🟢' : 'Vehicle marked as In Maintenance. It is now hidden from rentals. 🔧');
      fetchData();
    } catch (err) {
      toast.error('Failed to update maintenance status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagnostics = async (e) => {
    e.preventDefault();
    if (!selectedDiagVehicleId) return;
    setDiagSaving(true);
    try {
      await vehicleAPI.update(selectedDiagVehicleId, {
        tirePressure: Number(diagForm.tirePressure),
        batteryCharge: Number(diagForm.batteryCharge),
        fuelLevel: Number(diagForm.fuelLevel),
        nextService: diagForm.nextService || null
      });
      toast.success('Diagnostics updated successfully! 🛠️');
      fetchData();
    } catch (err) {
      toast.error('Failed to update diagnostics.');
    } finally {
      setDiagSaving(false);
    }
  };

  const handleAddServiceLog = async (e) => {
    e.preventDefault();
    if (!selectedDiagVehicleId) return;
    const selectedVehicle = vehicles.find(v => v._id === selectedDiagVehicleId);
    if (!selectedVehicle) return;

    const updatedLogs = [
      ...(selectedVehicle.serviceLogs || []),
      { serviceType: newLog.serviceType, date: new Date(newLog.date), notes: newLog.notes }
    ];

    setLoading(true);
    try {
      await vehicleAPI.update(selectedDiagVehicleId, {
        serviceLogs: updatedLogs,
        lastService: new Date(newLog.date)
      });
      toast.success('Service log added successfully! 📋');
      setNewLog(prev => ({ ...prev, notes: '' }));
      fetchData();
    } catch (err) {
      toast.error('Failed to add service log.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceCountdown = (nextServiceDate) => {
    if (!nextServiceDate) return { text: 'No service scheduled', color: 'text-slate-400 border-white/10 bg-white/5' };
    const next = new Date(nextServiceDate);
    const today = new Date();
    next.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        days: diffDays,
        text: `${diffDays} Day${diffDays > 1 ? 's' : ''} Remaining`,
        color: 'text-green-400 bg-green-400/10 border-green-500/20'
      };
    } else if (diffDays === 0) {
      return {
        days: 0,
        text: `Scheduled for Today!`,
        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20 animate-pulse'
      };
    } else {
      const overdue = Math.abs(diffDays);
      return {
        days: diffDays,
        text: `OVERDUE by ${overdue} Day${overdue > 1 ? 's' : ''}!`,
        color: 'text-red-400 bg-red-400/10 border-red-500/20 animate-pulse border-red-500/40'
      };
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

  const handleOpenEdit = (vehicle) => {
    setEditForm({ ...vehicle });
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleAPI.update(editForm._id, editForm);
      toast.success('Vehicle details updated successfully! 🎉');
      setEditForm(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = async () => {
    if (!removingVehicle) return;
    setLoading(true);
    try {
      await vehicleAPI.remove(removingVehicle._id);
      toast.success('Vehicle removed successfully! 🗑️');
      setRemovingVehicle(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove vehicle');
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

  const paidBookings = bookings.filter(b => ['confirmed', 'completed', 'active'].includes(b.status));
  const totalRevenue = paidBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthRevenue = paidBookings
    .filter(b => {
      const date = new Date(b.createdAt || b.pickupDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  const pendingPayout = bookings
    .filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  const getVehicleRevenue = (vehicleId) => {
    return paidBookings
      .filter(b => b.vehicle?._id === vehicleId || b.vehicle === vehicleId)
      .reduce((s, b) => s + (b.totalAmount || 0), 0);
  };

  const getVehiclePercentage = (vehicleId) => {
    if (totalRevenue === 0) return 0;
    return Math.min(100, Math.round((getVehicleRevenue(vehicleId) / totalRevenue) * 100));
  };

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
                  
                  <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-orange-400 font-bold">₹{v.dailyPrice?.toLocaleString()}/day</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${v.isAvailable ? 'text-green-400' : 'text-slate-500'}`}>
                        {v.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(v._id, v.isAvailable)}
                        disabled={v.status !== 'approved'}
                        className={`w-10 h-6 rounded-full p-0.5 transition-all duration-300 relative ${
                          v.status !== 'approved' ? 'opacity-30 cursor-not-allowed bg-slate-800' :
                          v.isAvailable ? 'bg-orange-500' : 'bg-slate-700'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 700, damping: 30 }}
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                          style={{
                            float: v.isAvailable ? 'right' : 'left'
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                    <button onClick={() => handleOpenEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-slate-400 hover:text-white text-xs transition-all"><Edit2 size={13} />Edit</button>
                    <button onClick={() => setRemovingVehicle(v)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs transition-all"><Trash2 size={13} />Remove</button>
                  </div>
                </motion.div>
              ))}
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveTab('add')}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/30 p-10 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-orange-400 transition-all">
                <Plus size={28} /><span className="text-sm font-medium">Add New Vehicle</span>
              </motion.button>
            </motion.div>
          )}

          {/* Diagnostics & Health */}
          {activeTab === 'diagnostics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {vehicles.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center border border-white/[0.07]">
                  <Wrench className="mx-auto text-slate-500 mb-4 animate-bounce" size={40} />
                  <h3 className="text-white font-bold text-lg mb-2">No Vehicles in Fleet</h3>
                  <p className="text-slate-400 text-sm mb-6">Please add a vehicle to view diagnostics and health trackers.</p>
                  <button onClick={() => setActiveTab('add')} className="btn-primary py-2 px-4 text-sm mx-auto">Add Vehicle</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column - Fleet List */}
                  <div className="glass card-glow rounded-2xl border border-white/[0.07] overflow-hidden lg:col-span-1">
                    <div className="p-5 border-b border-white/[0.06]">
                      <h3 className="text-white font-bold">Select Vehicle</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
                      {vehicles.map(v => {
                        const isSelected = v._id === selectedDiagVehicleId;
                        return (
                          <div key={v._id} 
                            onClick={() => setSelectedDiagVehicleId(v._id)}
                            className={`p-4 flex items-center gap-3.5 cursor-pointer transition-all ${
                              isSelected ? 'bg-orange-500/10 border-l-4 border-orange-500' : 'hover:bg-white/5 border-l-4 border-transparent'
                            }`}
                          >
                            <span className="text-3xl">{v.emoji || '🚗'}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-semibold truncate">{v.brand} {v.model}</h4>
                              <p className="text-slate-500 text-xs truncate uppercase tracking-wider">{v.vehicleNumber}</p>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              v.status === 'In Maintenance' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' :
                              v.status === 'approved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]' : 'bg-yellow-500'
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Columns - Vehicle Diagnostics */}
                  {selectedDiagVehicleId && (
                    (() => {
                      const selectedVehicle = vehicles.find(v => v._id === selectedDiagVehicleId);
                      if (!selectedVehicle) return null;
                      
                      const countdown = getServiceCountdown(selectedVehicle.nextService);
                      
                      return (
                        <div className="lg:col-span-2 space-y-6">
                          
                          {/* Selected Vehicle Info & Status Toggle */}
                          <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-4xl">{selectedVehicle.emoji || '🚗'}</span>
                                <div>
                                  <h2 className="text-xl font-bold text-white">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider">{selectedVehicle.vehicleNumber}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                              <div className="flex-1 flex flex-col justify-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Listing Status</span>
                                <span className={`text-sm font-bold capitalize ${
                                  selectedVehicle.status === 'In Maintenance' ? 'text-red-400' :
                                  selectedVehicle.status === 'approved' ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                  {selectedVehicle.status}
                                </span>
                              </div>
                              {selectedVehicle.status !== 'pending' && selectedVehicle.status !== 'rejected' && (
                                <button
                                  onClick={() => handleToggleMaintenance(selectedVehicle._id, selectedVehicle.status)}
                                  className={`btn font-bold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                                    selectedVehicle.status === 'In Maintenance'
                                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-glow-sm border-0'
                                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  {selectedVehicle.status === 'In Maintenance' ? (
                                    <>✅ Ready for Rent</>
                                  ) : (
                                    <>🔧 Put in Maintenance</>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* In Maintenance Warning Banner */}
                          {selectedVehicle.status === 'In Maintenance' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                            >
                              <AlertTriangle size={18} className="text-red-400 mt-0.5 animate-pulse" />
                              <div>
                                <h4 className="text-red-400 font-bold text-sm">Under Maintenance</h4>
                                <p className="text-slate-400 text-xs mt-0.5">This vehicle is currently hidden from rental searches and cannot be booked by customers.</p>
                              </div>
                            </motion.div>
                          )}

                          {/* 2-Column Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Virtual Health Indicators */}
                            <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] space-y-6">
                              <h3 className="text-white font-bold text-base flex items-center gap-2 border-b border-white/[0.05] pb-3">
                                <Activity size={18} className="text-orange-500" />
                                Virtual Health Indicators
                              </h3>
                              <form onSubmit={handleSaveDiagnostics} className="space-y-5">
                                
                                {/* Tire Pressure Slider */}
                                <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs text-slate-300 font-bold uppercase tracking-wider">Tire Pressure (PSI)</label>
                                    <span className={`text-sm font-black ${
                                      diagForm.tirePressure < 28 || diagForm.tirePressure > 36 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {diagForm.tirePressure} PSI
                                    </span>
                                  </div>
                                  <input 
                                    type="range" min="20" max="45" step="1" 
                                    value={diagForm.tirePressure}
                                    onChange={e => setDiagForm({ ...diagForm, tirePressure: Number(e.target.value) })}
                                    className="w-full accent-orange-500 cursor-pointer bg-white/5 h-2 rounded-lg"
                                  />
                                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                                    <span>20 (Low)</span>
                                    <span>{diagForm.tirePressure < 28 ? '⚠️ Under-inflated' : diagForm.tirePressure > 36 ? '⚠️ Over-inflated' : '🟢 Healthy'}</span>
                                    <span>45 (High)</span>
                                  </div>
                                </div>

                                {/* Battery Charge Slider */}
                                <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs text-slate-300 font-bold uppercase tracking-wider">Battery Charge (%)</label>
                                    <span className={`text-sm font-black ${
                                      diagForm.batteryCharge < 30 ? 'text-red-400' : diagForm.batteryCharge < 70 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {diagForm.batteryCharge}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="range" min="0" max="100" step="1" 
                                      value={diagForm.batteryCharge}
                                      onChange={e => setDiagForm({ ...diagForm, batteryCharge: Number(e.target.value) })}
                                      className="flex-1 accent-orange-500 cursor-pointer bg-white/5 h-2 rounded-lg"
                                    />
                                    <Battery size={20} className={
                                      diagForm.batteryCharge < 30 ? 'text-red-400 animate-pulse' : diagForm.batteryCharge < 70 ? 'text-yellow-400' : 'text-green-400'
                                    } />
                                  </div>
                                </div>

                                {/* Fuel / Charge Slider */}
                                <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                                      {selectedVehicle.fuelType === 'electric' ? 'Battery Level / range (%)' : 'Fuel level (%)'}
                                    </label>
                                    <span className={`text-sm font-black ${
                                      diagForm.fuelLevel < 15 ? 'text-red-400' : diagForm.fuelLevel < 40 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {diagForm.fuelLevel}%
                                    </span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="100" step="1" 
                                    value={diagForm.fuelLevel}
                                    onChange={e => setDiagForm({ ...diagForm, fuelLevel: Number(e.target.value) })}
                                    className="w-full accent-orange-500 cursor-pointer bg-white/5 h-2 rounded-lg"
                                  />
                                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-300 ${
                                      diagForm.fuelLevel < 15 ? 'bg-red-500' : diagForm.fuelLevel < 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} style={{ width: `${diagForm.fuelLevel}%` }} />
                                  </div>
                                </div>

                                <button 
                                  type="submit" 
                                  disabled={diagSaving} 
                                  className="btn-primary w-full justify-center text-xs py-3 mt-4"
                                >
                                  {diagSaving ? 'Saving Diagnostics...' : '💾 Save Health Diagnostics'}
                                </button>
                              </form>
                            </div>

                            {/* Service Tracking Logs & Next Service Countdown */}
                            <div className="space-y-6">
                              
                              {/* Next Service Tracker */}
                              <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] space-y-4">
                                <h3 className="text-white font-bold text-base flex items-center gap-2 border-b border-white/[0.05] pb-3">
                                  <Clock size={18} className="text-orange-500" />
                                  Next Service Tracker
                                </h3>
                                
                                <div className={`p-4 rounded-xl border font-bold text-center ${countdown.color}`}>
                                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Countdown Status</p>
                                  <p className="text-lg font-black mt-1">{countdown.text}</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Schedule Next Service</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="date" 
                                      className="input-field py-2 text-sm"
                                      value={diagForm.nextService}
                                      onChange={e => setDiagForm({ ...diagForm, nextService: e.target.value })}
                                    />
                                    <button 
                                      onClick={handleSaveDiagnostics} 
                                      disabled={diagSaving}
                                      className="px-4 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-all"
                                    >
                                      Schedule
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Service History Logs Card */}
                              <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07] space-y-4">
                                <h3 className="text-white font-bold text-base flex items-center gap-2 border-b border-white/[0.05] pb-3">
                                  <Activity size={18} className="text-orange-500" />
                                  Service Tracking Logs
                                </h3>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                  {(selectedVehicle.serviceLogs || []).length === 0 ? (
                                    <p className="text-xs text-slate-500 italic text-center py-4">No service history logs recorded.</p>
                                  ) : (
                                    selectedVehicle.serviceLogs.map((log, lIdx) => (
                                      <div key={lIdx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                        <div className="flex justify-between items-center">
                                          <span className="text-white text-xs font-bold">{log.serviceType}</span>
                                          <span className="text-slate-500 text-[10px]">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                        {log.notes && <p className="text-slate-400 text-xs leading-relaxed">{log.notes}</p>}
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Add Log Form */}
                                <form onSubmit={handleAddServiceLog} className="pt-3 border-t border-white/[0.05] space-y-3">
                                  <h4 className="text-white font-bold text-xs">Record New Service Log</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Service Type</label>
                                      <select 
                                        value={newLog.serviceType}
                                        onChange={e => setNewLog({ ...newLog, serviceType: e.target.value })}
                                        className="input-field py-2 text-xs"
                                      >
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Filter Replacement">Filter Replacement</option>
                                        <option value="Brake Check">Brake Check</option>
                                        <option value="General Maintenance">General Maintenance</option>
                                        <option value="Battery Diagnostics">Battery Diagnostics</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                                      <input 
                                        type="date"
                                        value={newLog.date}
                                        onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                                        className="input-field py-2 text-xs"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Service Notes</label>
                                    <input 
                                      type="text"
                                      value={newLog.notes}
                                      onChange={e => setNewLog({ ...newLog, notes: e.target.value })}
                                      placeholder="e.g. replaced air filters, checked oil level..."
                                      className="input-field py-2 text-xs"
                                      required
                                    />
                                  </div>
                                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 hover:border-orange-500/30 text-xs font-bold transition-all">
                                    <Plus size={14} /> Add Log Entry
                                  </button>
                                </form>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    })()
                  )}

                </div>
              )}
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
                  {['confirmed', 'active', 'completed'].includes(b.status) && (
                    <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-end">
                      <button 
                        onClick={() => setSelectedBookingForChat(b)} 
                        className="flex items-center gap-2 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl transition-all border border-orange-500/20"
                      >
                        <MessageSquare size={13} />
                        Chat & Coordination
                      </button>
                    </div>
                  )}
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
                  { label: 'This Month', value: `₹${thisMonthRevenue.toLocaleString()}`, color: 'text-green-400' },
                  { label: 'Pending Payout', value: `₹${pendingPayout.toLocaleString()}`, color: 'text-yellow-400' },
                ].map(s => (
                  <div key={s.label} className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                    <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                <h3 className="text-white font-bold mb-4">Revenue by Vehicle</h3>
                <div className="space-y-4">
                  {vehicles.map(v => {
                    const rev = getVehicleRevenue(v._id);
                    const pct = getVehiclePercentage(v._id);
                    return (
                      <div key={v._id} className="flex items-center gap-4">
                        <span className="text-2xl">{v.emoji || '🚗'}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{v.brand} {v.model}</p>
                          <div className="w-full bg-white/5 rounded-full h-2 mt-1.5">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-orange-400 font-semibold text-sm">₹{rev.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  {vehicles.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-6">No vehicles in your fleet to compute stats.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Vehicle Modal */}
          {editForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
              <div className="glass card-glow rounded-2xl p-6 border border-white/10 w-full max-w-2xl my-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Edit Vehicle Details</h2>
                  <button onClick={() => setEditForm(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
                </div>
                <form onSubmit={handleUpdateVehicle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Vehicle Number *</label>
                      <input className="input-field" placeholder="GJ01AB1234" value={editForm.vehicleNumber} onChange={e => setEditForm({ ...editForm, vehicleNumber: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Brand *</label>
                      <input className="input-field" placeholder="Honda" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Model *</label>
                      <input className="input-field" placeholder="City" value={editForm.model} onChange={e => setEditForm({ ...editForm, model: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Type *</label>
                      <select className="input-field" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                        <option value="car">Car</option>
                        <option value="suv">SUV</option>
                        <option value="bike">Bike</option>
                        <option value="activa">Activa</option>
                        <option value="taxi">Taxi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Fuel Type</label>
                      <select className="input-field" value={editForm.fuelType} onChange={e => setEditForm({ ...editForm, fuelType: e.target.value })}>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="cng">CNG</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Transmission</label>
                      <select className="input-field" value={editForm.transmission} onChange={e => setEditForm({ ...editForm, transmission: e.target.value })}>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Daily Price (₹) *</label>
                      <input type="number" className="input-field" placeholder="1200" value={editForm.dailyPrice} onChange={e => setEditForm({ ...editForm, dailyPrice: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Weekly Price (₹)</label>
                      <input type="number" className="input-field" placeholder="7000" value={editForm.weeklyPrice || ''} onChange={e => setEditForm({ ...editForm, weeklyPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Monthly Price (₹)</label>
                      <input type="number" className="input-field" placeholder="20000" value={editForm.monthlyPrice || ''} onChange={e => setEditForm({ ...editForm, monthlyPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">City *</label>
                      <select className="input-field" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })}>
                        <option value="ahmedabad">Ahmedabad</option>
                        <option value="surat">Surat</option>
                        <option value="vadodara">Vadodara</option>
                        <option value="rajkot">Rajkot</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                    <textarea className="input-field h-24 resize-none" placeholder="Describe your vehicle..." value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setEditForm(null)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 text-sm">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Remove Vehicle Confirmation Modal */}
          {removingVehicle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="glass card-glow rounded-2xl p-6 border border-white/10 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-2">Remove Vehicle</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to remove <span className="text-white font-bold">{removingVehicle.brand} {removingVehicle.model}</span> ({removingVehicle.vehicleNumber}) from your fleet? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setRemovingVehicle(null)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold transition-all">Cancel</button>
                  <button type="button" onClick={handleRemoveVehicle} disabled={loading} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all">
                    {loading ? 'Removing...' : '🗑️ Yes, Remove'}
                  </button>
                </div>
              </div>
            </div>
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
