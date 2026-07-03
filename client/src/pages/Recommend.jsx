import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SmartRideWizard from '../components/sections/SmartRideWizard';
import { HelpCircle, Star, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Recommend() {
  return (
    <div className="min-h-screen bg-dark-900 relative">
      <Navbar />

      {/* Decorative Blob */}
      <div className="blob blob-orange w-[500px] h-[500px] absolute top-10 left-10 opacity-[0.05] blur-[120px] pointer-events-none" />

      <main className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Header Description */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-tag mx-auto"
            >
              <Sparkles size={12} className="text-orange-500 fill-orange-500/20" />
              Smart Match Finder
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black text-white mt-4"
            >
              AI-Driven <span className="gradient-text">Smart Ride</span> Recommender
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base"
            >
              Take our interactive 4-step wizard quiz. Our matching intelligence evaluates your terrain profile, passenger seating requirements, cargo load, and transmission preference against our active fleet to recommend the perfect fit.
            </motion.p>
          </div>

          {/* Interactive Wizard component */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <SmartRideWizard />
          </motion.div>

          {/* Guidelines Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="glass p-6 rounded-2xl border-white/5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-2">How compatibility is calculated?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We assign compatibility ratings by cross-referencing your trip purpose, passenger seating boundaries, luggage volumes, and mechanical preference weights directly with live manufacturer specifications.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-2xl border-white/5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-2">Next steps after matching</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Once your compatibility matches resolve, you can directly launch the instant booking form. The matching vehicle index is automatically carried forward to save you time.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
