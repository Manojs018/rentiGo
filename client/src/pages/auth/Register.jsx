import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer', city: 'Ahmedabad' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['customer', 'owner'].includes(roleParam)) {
      setForm(prev => ({ ...prev, role: roleParam }));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i;
    if (!gmailRegex.test(form.email)) {
      toast.error('Only Google email accounts (@gmail.com or @googlemail.com) are allowed');
      return;
    }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      toast.success(res?.message || 'Registration successful!', { duration: 4000 });
      const targetRole = res?.user?.role || form.role;
      if (targetRole === 'owner') navigate('/owner');
      else if (targetRole === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="blob blob-orange w-[500px] h-[500px] absolute -top-40 -right-40 opacity-[0.08]" />
      <div className="blob blob-amber w-[400px] h-[400px] absolute -bottom-20 -left-20 opacity-[0.06]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
            <Car size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold"><span className="gradient-text">Renti</span><span className="text-white">Go</span></span>
        </Link>

        <div className="glass card-glow rounded-2xl p-8 border border-white/[0.07]">
          <h1 className="text-2xl font-black text-white mb-2">Create Account 🚀</h1>
          <p className="text-slate-400 text-sm mb-8">Join thousands of happy RentiGo users</p>

          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 glass rounded-xl">
            {['customer', 'owner'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  form.role === role ? 'bg-orange-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {role === 'customer' ? '🚗 Customer' : '🏢 Vehicle Owner'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Rahul Sharma" className="input-field pl-10" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" placeholder="you@email.com" className="input-field pl-10" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" placeholder="+91 98765..." className="input-field pl-10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars" className="input-field pl-10 pr-8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">City</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select className="input-field pl-10" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                    <option>Ahmedabad</option><option>Surat</option><option>Vadodara</option><option>Rajkot</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</span>
                : <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-white/[0.08]" />
            <span className="px-3 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-white/[0.08]" />
          </div>

          <div className="flex justify-center w-full google-btn-container mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  const data = await googleLogin(credentialResponse.credential, form.role);
                  toast.success('Welcome to RentiGo! 🚗');
                  if (data.user.role === 'owner') navigate('/owner');
                  else navigate('/dashboard');
                } catch (err) {
                  toast.error(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                toast.error('Google Sign-In failed. Please try again.');
              }}
              theme="filled_black"
              shape="rectangular"
              width="100%"
            />
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
