import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successful! 🎉');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="blob blob-orange w-[400px] h-[400px] absolute top-0 right-0 opacity-[0.07]" />
      <div className="blob blob-amber w-[400px] h-[400px] absolute bottom-0 left-0 opacity-[0.05]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
            <Car size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="gradient-text">Renti</span><span className="text-white">Go</span>
          </span>
        </Link>

        <div className="glass card-glow rounded-2xl p-8 border border-white/[0.07]">
          {!success ? (
            <>
              <h1 className="text-2xl font-black text-white mb-2">Create New Password 🔑</h1>
              <p className="text-slate-400 text-sm mb-8">Please enter your new secure password.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type={showPass ? 'text' : 'password'} 
                      placeholder="Minimum 6 characters" 
                      className="input-field pl-10 pr-10" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)} 
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type={showConfirmPass ? 'text' : 'password'} 
                      placeholder="Repeat new password" 
                      className="input-field pl-10 pr-10" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPass(!showConfirmPass)} 
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary w-full justify-center py-3.5 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4 text-emerald-500">
                <CheckCircle2 size={56} className="animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">All Set!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your password has been successfully reset. Redirecting you to the Sign In page in a few seconds...
              </p>
              <Link to="/login" className="btn-primary w-full justify-center py-3.5">
                Sign In Now
              </Link>
            </div>
          )}

          {!success && (
            <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm mt-6 transition-colors">
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
