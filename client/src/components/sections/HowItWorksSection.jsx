import { motion } from 'framer-motion';

const steps = [
  { num: '01', icon: '🚗', title: 'Choose Vehicle', desc: 'Select from cars, bikes, activas, or taxis that fit your needs and budget.' },
  { num: '02', icon: '📝', title: 'Fill Details', desc: 'Enter your pickup time, date, location and personal details.' },
  { num: '03', icon: '🎉', title: 'Enjoy Your Ride', desc: 'Your vehicle is confirmed! Enjoy your ride with complete comfort & safety.' },
];

export default function HowItWorksSection() {
  return (
    <section className="section py-24" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div className="section-tag mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>⚡ How It Works</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Book in <span className="gradient-text">3 Simple Steps</span>
          </motion.h2>
          <motion.p className="text-slate-400 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            Getting your rental vehicle has never been easier. Just 3 steps to your ride.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" style={{ left: '20%', right: '20%' }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-glow group-hover:shadow-glow-lg transition-all duration-300 group-hover:scale-110">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-dark-900 border-2 border-orange-500 flex items-center justify-center text-xs font-black text-orange-400">
                    {step.num}
                  </div>
                </div>

                <div className="glass card-glow rounded-2xl p-6 w-full border border-white/[0.07] hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-1">
                  <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
