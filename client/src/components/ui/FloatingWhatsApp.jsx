import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WA_LINK = 'https://wa.me/919687008865?text=Hi,%20I%20want%20to%20book%20a%20ride%20with%20RentiGo';

export default function FloatingWhatsApp() {
  return (
    <motion.a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-3 rounded-full shadow-lg shadow-green-500/30 font-semibold text-sm transition-all duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle size={20} className="fill-white" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </motion.a>
  );
}
