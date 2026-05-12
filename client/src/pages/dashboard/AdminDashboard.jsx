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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
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

const userStats = [
  { name: 'Active', value: 400, color: '#f97316' },
  { name: 'New', value: 300, color: '#f59e0b' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
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

  const kpiCards = [
    { label: 'Total Revenue', value: `₹${analytics?.kpis?.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Users', value: analytics?.kpis?.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Vehicles', value: analytics?.kpis?.totalVehicles, icon: Car, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending Approvals', value: analytics?.kpis?.pendingVehicles, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

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
                  <button className="text-orange-400 text-xs font-bold hover:underline">View All Bookings</button>
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
                            <div className="text-sm font-bold text-white">{booking.customer.name}</div>
                            <div className="text-[10px] text-slate-500">ID: #{booking._id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">{booking.vehicle.brand} {booking.vehicle.model}</div>
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
                            <button className="p-1.5 glass rounded-lg text-slate-400 hover:text-white">
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

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-orange-500">
                <BarChart3 size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{activeTab} Section</h2>
              <p className="text-slate-500 text-sm max-w-xs">
                This management module is being populated with live data from the system.
              </p>
              <button onClick={() => setActiveTab('overview')} className="btn-primary mt-6 text-xs px-4 py-2">
                Back to Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
