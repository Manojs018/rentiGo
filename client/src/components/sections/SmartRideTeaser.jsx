import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Wand2, Compass } from 'lucide-react';

export default function SmartRideTeaser() {
  return (
    <section className="section py-20 relative overflow-hidden" id="smart-ride-teaser">
      {/* Dynamic Background Glows */}
      <div className="blob blob-orange w-[500px] h-[500px] absolute -top-40 -left-40 opacity-[0.08] blur-[100px] pointer-events-none" />
      <div className="blob blob-orange w-[400px] h-[400px] absolute -bottom-20 -right-20 opacity-[0.06] blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="glass card-glow rounded-3xl border border-white/[0.08] p-8 md:p-12 lg:p-16 bg-gradient-to-br from-white/[0.01] via-white/[0.02] to-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-orange-500/20 transition-colors duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <motion.div 
                className="section-tag"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Sparkles size={13} className="text-orange-500 fill-orange-500/20 animate-pulse" />
                AI-Powered Recommendations
              </motion.div>
              
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mt-3 mb-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Not sure which <span className="gradient-text">ride matches</span> your trip?
              </motion.h2>
              
              <motion.p 
                className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Try our interactive <strong>Smart Ride Wizard</strong>. In just 4 simple steps, our recommendation engine evaluates your terrain profile, passenger capacity, luggage, and gearbox preferences to identify the absolute best vehicle from our fleet.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/recommend" className="btn-primary group text-base px-8 py-4 rounded-2xl shadow-glow transition-all duration-300">
                  <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
                  <span>Start Recommender Quiz</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Right Interactive Teaser Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-[400px] relative glass border border-white/10 rounded-2xl p-6 shadow-2xl bg-dark-800/80 backdrop-blur-md overflow-hidden group hover:border-orange-500/30 transition-all duration-500"
              >
                {/* Decorative scanning line animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse opacity-40 shadow-glow" />
                
                {/* Mock Card Preview */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400 font-bold text-xs">
                      1
                    </div>
                    <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Trip Profile</span>
                  </div>
                  <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Ready</span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-orange-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⛰️</span>
                      <div className="text-left">
                        <span className="text-white text-xs font-bold block">Adventure Outing</span>
                        <span className="text-slate-500 text-[10px] block">Gravel & mountain paths</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💼</span>
                      <div className="text-left">
                        <span className="text-white text-xs font-bold block">Business Meeting</span>
                        <span className="text-slate-500 text-[10px] block">City & premium highways</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  </div>
                </div>

                {/* Score Match Highlight */}
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-glow-sm">
                      97%
                    </div>
                    <div className="text-left">
                      <span className="text-white text-xs font-black block">Mahindra XUV 700</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Top Match Recommendation</span>
                    </div>
                  </div>
                  <Compass size={18} className="text-orange-500 animate-spin-slow" />
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
