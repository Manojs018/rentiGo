import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  Calendar,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Home,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Search,
  Mail,
  Phone,
  Check,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 8000 },
  { name: 'May', revenue: 7000 },
  { name: 'Jun', revenue: 9000 },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Users management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Vehicles management state
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [activeRejectVehicleId, setActiveRejectVehicleId] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Bookings management state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [activeCancelBookingId, setActiveCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Settings state (mocked / locally persisted)
  const [commissionFee, setCommissionFee] = useState('10');
  const [taxRate, setTaxRate] = useState('18');
  const [requireVerification, setRequireVerification] = useState(true);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportEmail, setSupportEmail] = useState('support@rentigo.com');
  const [minRentalDays, setMinRentalDays] = useState('1');
  const [maxRentalDays, setMaxRentalDays] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab, userFilter, vehicleFilter, bookingFilter]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('rentigo_admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCommissionFee(parsed.commissionFee || '10');
        setTaxRate(parsed.taxRate || '18');
        setRequireVerification(parsed.requireVerification !== undefined ? parsed.requireVerification : true);
        setAllowRegistrations(parsed.allowRegistrations !== undefined ? parsed.allowRegistrations : true);
        setMaintenanceMode(parsed.maintenanceMode !== undefined ? parsed.maintenanceMode : false);
        setSupportEmail(parsed.supportEmail || 'support@rentigo.com');
        setMinRentalDays(parsed.minRentalDays || '1');
        setMaxRentalDays(parsed.maxRentalDays || '30');
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data.data);
    } catch (error) {
      // Demo fallback
      setAnalytics({
        kpis: {
          totalUsers: 1240,
          totalOwners: 45,
          totalVehicles: 520,
          totalBookings: 890,
          pendingVehicles: 12,
          activeBookings: 45,
          totalRevenue: 245000,
        },
        recentBookings: [
          { _id: '1', customer: { name: 'Manoj Kumar' }, vehicle: { brand: 'Toyota', model: 'Innova' }, totalAmount: 4500, status: 'confirmed' },
          { _id: '2', customer: { name: 'Suresh Patel' }, vehicle: { brand: 'Honda', model: 'Activa' }, totalAmount: 800, status: 'pending' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await adminAPI.getUsers({
        role: userFilter !== 'all' ? userFilter : undefined
      });
      setUsers(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const { data } = await adminAPI.getVehicles({
        status: vehicleFilter !== 'all' ? vehicleFilter : undefined
      });
      setVehicles(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
      console.error(error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data } = await adminAPI.getBookings({
        status: bookingFilter !== 'all' ? bookingFilter : undefined
      });
      setBookings(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await adminAPI.toggleUser(userId);
      if (data.success) {
        toast.success(`User status updated successfully`);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.data.isActive } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleApproveVehicle = async (vehicleId, status, note = '') => {
    try {
      const { data } = await adminAPI.approveVehicle(vehicleId, { status, adminNote: note });
      if (data.success) {
        toast.success(`Vehicle ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        setVehicles(vehicles.map(v => v._id === vehicleId ? { ...v, status: data.data.status, adminNote: data.data.adminNote } : v));
        fetchAnalytics(); // Refresh KPI counts on the overview
        setActiveRejectVehicleId(null);
        setRejectionNote('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update vehicle status');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status, reason = '') => {
    try {
      const { data } = await bookingAPI.updateStatus(bookingId, { status, cancelReason: reason });
      if (data.success) {
        toast.success(`Booking status updated to ${status}`);
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: data.data.status, cancelReason: data.data.cancelReason } : b));
        fetchAnalytics(); // Refresh overview KPIs
        setActiveCancelBookingId(null);
        setCancelReason('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const settingsObj = {
      commissionFee,
      taxRate,
      requireVerification,
      allowRegistrations,
      maintenanceMode,
      supportEmail,
      minRentalDays,
      maxRentalDays
    };
    localStorage.setItem('rentigo_admin_settings', JSON.stringify(settingsObj));
    toast.success('Admin settings saved successfully!');
  };

  const kpiCards = [
    { label: 'Total Revenue', value: analytics?.kpis?.totalRevenue !== undefined ? `₹${analytics.kpis.totalRevenue.toLocaleString()}` : '₹0', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Users', value: analytics?.kpis?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Vehicles', value: analytics?.kpis?.totalVehicles ?? 0, icon: Car, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending Approvals', value: analytics?.kpis?.pendingVehicles ?? 0, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  // Users Filter & Search
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  // Vehicles Filter & Search
  const filteredVehicles = vehicles.filter(v =>
    v.brand?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.model?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.owner?.name?.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  // Bookings Filter & Search
  const filteredBookings = bookings.filter(b =>
    b._id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.customer?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.customer?.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.vehicle?.brand?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.vehicle?.model?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  // Users Tab Render
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'customer', 'owner', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setUserFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                userFilter === role
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass card-glow p-12 text-center text-slate-500 border border-white/[0.07] rounded-2xl">
          No users found matching current filters.
        </div>
      ) : (
        <div className="glass card-glow rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 font-bold border border-orange-500/10 flex items-center justify-center text-sm capitalize">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            u.name?.substring(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-500">ID: #{u._id.substring(u._id.length - 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5"><Mail size={13} className="text-slate-500" /> {u.email}</div>
                      {u.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Phone size={13} className="text-slate-500" /> {u.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        u.role === 'owner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        disabled={u.role === 'admin'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          u.role === 'admin'
                            ? 'bg-transparent text-slate-600 border border-slate-800 cursor-not-allowed'
                            : u.isActive
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Vehicles Tab Render
  const renderVehicles = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search brand, model, plate, owner..."
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setVehicleFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                vehicleFilter === status
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loadingVehicles ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass card-glow p-12 text-center text-slate-500 border border-white/[0.07] rounded-2xl">
          No vehicles found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVehicles.map((v) => (
            <div key={v._id} className="glass card-glow border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 h-16 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.model} className="w-full h-full object-cover" />
                    ) : (
                      <Car size={24} className="text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-white truncate">{v.brand} {v.model}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 ${
                        v.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        v.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-xs text-orange-400 font-bold mt-1">₹{v.dailyPrice}/day</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{v.type} • {v.fuelType} • {v.transmission}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/[0.04] text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">VEHICLE NUMBER</span>
                    <span className="text-slate-300 font-bold uppercase">{v.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LOCATION</span>
                    <span className="text-slate-300 font-bold capitalize">{v.city}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 bg-white/[0.01] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-slate-500 text-[10px] block font-bold uppercase">Owner Contact</span>
                  <div className="font-bold text-white">{v.owner?.name}</div>
                  <div className="text-slate-400 flex items-center gap-1.5 mt-0.5"><Mail size={12} /> {v.owner?.email}</div>
                  {v.owner?.phone && (
                    <div className="text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone size={12} /> {v.owner?.phone}</div>
                  )}
                </div>

                {v.adminNote && (
                  <div className="text-xs bg-red-500/5 border border-red-500/10 text-red-400/80 p-3 rounded-xl">
                    <span className="font-bold block text-[10px] uppercase text-red-400 mb-1">Admin Rejection Note</span>
                    {v.adminNote}
                  </div>
                )}

                {activeRejectVehicleId === v._id && (
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/15 space-y-3">
                    <label className="text-[10px] font-bold text-red-400 block uppercase">Rejection Reason</label>
                    <textarea
                      rows={2}
                      className="input-field text-xs resize-none"
                      placeholder="Specify why this vehicle is rejected..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setActiveRejectVehicleId(null); setRejectionNote(''); }}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleApproveVehicle(v._id, 'rejected', rejectionNote)}
                        disabled={!rejectionNote.trim()}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {v.status === 'pending' && activeRejectVehicleId !== v._id && (
                <div className="px-5 py-3.5 bg-white/[0.01] border-t border-white/[0.04] flex gap-2 justify-end">
                  <button
                    onClick={() => setActiveRejectVehicleId(v._id)}
                    className="px-4 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveVehicle(v._id, 'approved')}
                    className="px-4 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-all"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Bookings Tab Render
  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search customer, vehicle, booking ID..."
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setBookingFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                bookingFilter === status
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loadingBookings ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass card-glow p-12 text-center text-slate-500 border border-white/[0.07] rounded-2xl">
          No bookings found matching current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b._id} className="glass card-glow border border-white/[0.07] rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Booking Reference</span>
                  <span className="text-sm font-black text-white uppercase">#{b._id}</span>
                  <span className="text-xs text-slate-400 ml-2">Booked on {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    b.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    b.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    b.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block font-bold uppercase">Customer</span>
                  <div className="font-bold text-white text-sm">{b.customerName || b.customer?.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5"><Mail size={12} className="text-slate-500" /> {b.customerEmail || b.customer?.email}</div>
                  {b.customerPhone && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone size={12} className="text-slate-500" /> {b.customerPhone}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block font-bold uppercase">Vehicle & Owner</span>
                  <div className="font-bold text-white text-sm">
                    {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : 'Vehicle Details Unavailable'}
                  </div>
                  {b.vehicle?.type && (
                    <div className="text-[10px] text-slate-500 uppercase font-medium">{b.vehicle.type} • City: {b.city || b.vehicle.city}</div>
                  )}
                  {b.owner && (
                    <div className="text-xs text-slate-400 mt-2">
                      <span className="text-slate-500 text-[9px] block uppercase font-bold">Owner Contact</span>
                      <div className="font-bold text-slate-300 text-xs">{b.owner.name} • {b.owner.phone || b.owner.email}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold uppercase">Rental Period</span>
                      <div className="text-xs text-white font-medium">
                        {new Date(b.pickupDate).toLocaleDateString()} - {new Date(b.returnDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-orange-400 font-bold mt-0.5">{b.durationDays} Days ({b.rentalPlan} plan)</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block font-bold uppercase">Total Amount</span>
                      <div className="text-lg font-black text-orange-400">₹{b.totalAmount?.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">incl. GST</div>
                    </div>
                  </div>
                </div>
              </div>

              {activeCancelBookingId === b._id && (
                <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/15 space-y-3">
                  <label className="text-[10px] font-bold text-red-400 block uppercase">Reason for Cancellation</label>
                  <textarea
                    rows={2}
                    className="input-field text-xs resize-none"
                    placeholder="Specify why this booking is cancelled..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setActiveCancelBookingId(null); setCancelReason(''); }}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'cancelled', cancelReason)}
                      disabled={!cancelReason.trim()}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </div>
              )}

              {b.status === 'cancelled' && b.cancelReason && (
                <div className="text-xs bg-red-500/5 border border-red-500/10 text-red-400/80 p-3 rounded-xl">
                  <span className="font-bold block text-[10px] uppercase text-red-400 mb-1">Cancellation Reason</span>
                  {b.cancelReason}
                </div>
              )}

              {activeCancelBookingId !== b._id && !['completed', 'cancelled'].includes(b.status) && (
                <div className="flex gap-2 justify-end pt-3 border-t border-white/[0.04]">
                  <button
                    onClick={() => setActiveCancelBookingId(b._id)}
                    className="px-3.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                  >
                    Cancel Booking
                  </button>

                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                      className="px-3.5 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-all"
                    >
                      Confirm Booking
                    </button>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'active')}
                      className="px-3.5 py-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition-all"
                    >
                      Start Trip (Active)
                    </button>
                  )}

                  {b.status === 'active' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                      className="px-3.5 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all"
                    >
                      Complete Trip
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Settings Tab Render
  const renderSettings = () => (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
      <div className="glass card-glow rounded-2xl border border-white/[0.07] p-6 space-y-4">
        <h3 className="text-white font-bold text-sm border-b border-white/[0.04] pb-2">Financial Configurations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Commission Fee (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={commissionFee}
              onChange={(e) => setCommissionFee(e.target.value)}
              className="input-field"
              required
            />
            <p className="text-[10px] text-slate-500">Percentage charged to owners per booking.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Tax Rate (GST %)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="input-field"
              required
            />
            <p className="text-[10px] text-slate-500">Applied standard government service tax percentage.</p>
          </div>
        </div>
      </div>

      <div className="glass card-glow rounded-2xl border border-white/[0.07] p-6 space-y-4">
        <h3 className="text-white font-bold text-sm border-b border-white/[0.04] pb-2">System Rules & Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Minimum Rental Duration (Days)</label>
            <input
              type="number"
              min="1"
              value={minRentalDays}
              onChange={(e) => setMinRentalDays(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Maximum Rental Duration (Days)</label>
            <input
              type="number"
              min="1"
              value={maxRentalDays}
              onChange={(e) => setMaxRentalDays(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
            <div>
              <span className="text-xs font-bold text-white block">Require Approval</span>
              <span className="text-[10px] text-slate-500">Verify vehicles before listing</span>
            </div>
            <button
              type="button"
              onClick={() => setRequireVerification(!requireVerification)}
              className={`w-11 h-6 rounded-full transition-colors relative ${requireVerification ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${requireVerification ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
            <div>
              <span className="text-xs font-bold text-white block">Allow Signups</span>
              <span className="text-[10px] text-slate-500">Allow user portal signup flow</span>
            </div>
            <button
              type="button"
              onClick={() => setAllowRegistrations(!allowRegistrations)}
              className={`w-11 h-6 rounded-full transition-colors relative ${allowRegistrations ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${allowRegistrations ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
            <div>
              <span className="text-xs font-bold text-white block">Maintenance</span>
              <span className="text-[10px] text-slate-500">Enable system maintenance</span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${maintenanceMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass card-glow rounded-2xl border border-white/[0.07] p-6 space-y-4">
        <h3 className="text-white font-bold text-sm border-b border-white/[0.04] pb-2">Support Contacts</h3>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Support Email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Save Settings
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
              <ShieldCheck size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold"><span className="gradient-text">Admin</span><span className="text-white">Panel</span></span>
          </Link>
          <p className="text-xs text-slate-500 mt-2">RentiGo Management</p>
        </div>

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

        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
            <Home size={17} /> Site Home
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden glass p-2 rounded-xl text-white">
              <span className="text-xl">☰</span>
            </button>
            <h1 className="text-lg font-bold text-white capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-medium text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Status: Healthy
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20">
              A
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass card-glow rounded-2xl p-5 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <card.icon size={20} className={card.color} />
                      </div>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                        +12.5%
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white">{card.value}</div>
                    <div className="text-slate-500 text-xs mt-1 font-medium">{card.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold">Revenue Growth</h3>
                    <select className="bg-transparent text-xs text-slate-400 outline-none border border-white/10 rounded-lg px-2 py-1">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass card-glow rounded-2xl p-6 border border-white/[0.07]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold">Platform Activity</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[10px] text-slate-400">Bookings</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-slate-400">Logins</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Tables */}
              <div className="glass card-glow rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Recent Platform Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-orange-400 text-xs font-bold hover:underline">View All Bookings</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {analytics?.recentBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-white">{booking.customer?.name || booking.customerName || 'N/A'}</div>
                            <div className="text-[10px] text-slate-500">ID: #{booking._id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">{booking.vehicle?.brand || ''} {booking.vehicle?.model || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-orange-400">₹{booking.totalAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => setActiveTab('bookings')} className="p-1.5 glass rounded-lg text-slate-400 hover:text-white">
                              <MoreVertical size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && renderUsers()}
          {activeTab === 'vehicles' && renderVehicles()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
}
