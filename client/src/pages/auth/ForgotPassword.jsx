import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Mail, ArrowLeft, Send } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset instructions sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="blob blob-orange w-[400px] h-[400px] absolute top-0 right-0 opacity-[0.07]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
            <Car size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold"><span className="gradient-text">Renti</span><span className="text-white">Go</span></span>
        </Link>

        <div className="glass card-glow rounded-2xl p-8 border border-white/[0.07]">
          {!sent ? (
            <>
              <h1 className="text-2xl font-black text-white mb-2">Reset Password 🔑</h1>
              <p className="text-slate-400 text-sm mb-8">Enter your email to receive reset instructions.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" placeholder="your@email.com" className="input-field pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? 'Sending...' : <span className="flex items-center gap-2"><Send size={16} /> Send Reset Link</span>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-white mb-3">Check Your Email!</h2>
              <p className="text-slate-400 text-sm mb-6">We've sent password reset instructions to <span className="text-orange-400">{email}</span></p>
              <button onClick={() => setSent(false)} className="btn-ghost text-sm">Try another email</button>
            </div>
          )}
          <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm mt-6 transition-colors">
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
