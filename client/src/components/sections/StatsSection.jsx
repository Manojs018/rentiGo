import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 10000, label: 'Happy Customers', suffix: '+', icon: '😊' },
  { value: 500, label: 'Vehicles Available', suffix: '+', icon: '🚗' },
  { value: 50, label: 'Cities Covered', suffix: '+', icon: '🌆' },
  { value: 24, label: 'Hour Support', suffix: '/7', icon: '⚡' },
];

function Counter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="text-4xl sm:text-5xl font-black gradient-text">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="section py-20 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="glass card-glow rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <Counter target={stat.value} suffix={stat.suffix} />
                <p className="text-slate-400 text-sm mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
