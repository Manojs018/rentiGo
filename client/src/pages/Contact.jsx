import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! Our team will contact you soon.');
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mn-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-tag mx-auto">Contact Us</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight">
              Let's <span className="gradient-text">Get in Touch</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 mt-6 max-w-xl mx-auto text-lg">
              Have questions or need assistance? Our support team is available 24/7 to help you with your booking.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                  <Phone size={20} />
                </div>
                <h3 className="text-white font-bold mb-1">Call Us</h3>
                <p className="text-slate-400 text-sm mb-3">Available 24/7 for urgent help.</p>
                <a href="tel:+919687008865" className="text-orange-400 font-bold hover:underline">+91 96870 08865</a>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Mail size={20} />
                </div>
                <h3 className="text-white font-bold mb-1">Email Support</h3>
                <p className="text-slate-400 text-sm mb-3">We'll respond within 2 hours.</p>
                <a href="mailto:team@rentigo.in" className="text-blue-400 font-bold hover:underline">team@rentigo.in</a>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-white font-bold mb-1">Visit Office</h3>
                <p className="text-slate-400 text-sm">Dwarka, Gujarat, India - 361335</p>
              </motion.div>

              <motion.a
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                href="https://wa.me/919687008865"
                className="flex items-center gap-4 glass p-6 rounded-3xl border-green-500/10 hover:border-green-500/30 transition-all bg-green-500/5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">WhatsApp Chat</h3>
                  <p className="text-green-400 text-xs font-semibold">Online Now</p>
                </div>
              </motion.a>
            </div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass card-glow rounded-3xl p-8 sm:p-10 border-white/5">
              <h2 className="text-2xl font-black text-white mb-6">Send us a <span className="gradient-text">Message</span></h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Subject</label>
                  <select
                    className="input-field"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  >
                    <option>General Inquiry</option>
                    <option>Booking Issue</option>
                    <option>Partner Program</option>
                    <option>Payment/Refund</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Message</label>
                  <textarea
                    className="input-field h-40 resize-none"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto px-10 py-4 justify-center">
                  {loading ? 'Sending Message...' : <span className="flex items-center gap-2">Send Message <Send size={18} /></span>}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
