import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

const verificationListeners = {}; // token -> array of listener functions
const verificationCache = {};     // token -> { status, message }
const inFlightRequests = new Set();

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    // 1. If we already have a cached result for this token, use it immediately
    if (verificationCache[token]) {
      setStatus(verificationCache[token].status);
      setMessage(verificationCache[token].message);
      return;
    }

    // 2. Register this component instance's state setters as a listener
    if (!verificationListeners[token]) {
      verificationListeners[token] = [];
    }
    const listener = (result) => {
      setStatus(result.status);
      setMessage(result.message);
    };
    verificationListeners[token].push(listener);

    // 3. If a request is already in flight, don't trigger a new one
    if (inFlightRequests.has(token)) {
      return () => {
        verificationListeners[token] = verificationListeners[token].filter(l => l !== listener);
      };
    }

    inFlightRequests.add(token);

    const verify = async () => {
      let result;
      try {
        const { data } = await authAPI.verifyEmail(token);
        result = { status: 'success', message: data.message || 'Email verified successfully!' };
      } catch (err) {
        result = { status: 'error', message: err.response?.data?.message || 'Invalid or expired verification link.' };
      }

      // Cache result and clear in-flight status
      verificationCache[token] = result;
      inFlightRequests.delete(token);

      // Notify all registered listeners
      const activeListeners = verificationListeners[token] || [];
      activeListeners.forEach(l => l(result));
    };

    verify();

    return () => {
      verificationListeners[token] = verificationListeners[token].filter(l => l !== listener);
    };
  }, [token]);

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

        <div className="glass card-glow rounded-2xl p-8 border border-white/[0.07] text-center">
          {status === 'verifying' && (
            <div className="py-6 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verifying Your Email</h2>
              <p className="text-slate-400 text-sm">Please wait while we confirm your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-3">Verified! 🎉</h2>
              <p className="text-slate-300 text-sm mb-8">{message}</p>
              <Link to="/login" className="btn-primary w-full justify-center py-3.5 flex items-center gap-2">
                Sign In Now <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-3">Verification Failed</h2>
              <p className="text-red-400 text-sm mb-8">{message}</p>
              <Link to="/register" className="btn-primary w-full justify-center py-3.5 flex items-center gap-2">
                Back to Registration <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
