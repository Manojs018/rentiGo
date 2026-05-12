import { Link } from 'react-router-dom';
import { Car, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

const Facebook = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Twitter = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);const footerLinks = {
  quick: [
    { label: '🏠 Home', path: '/' },
    { label: 'ℹ️ About Us', path: '/about' },
    { label: '🚘 Rentals', path: '/rentals' },
    { label: '📞 Contact', path: '/contact' },
    { label: '🔒 Privacy Policy', path: '/privacy' },
    { label: '📜 Terms & Conditions', path: '/terms' },
  ],
  partner: [
    { label: '📢 List Your Business', path: '/contact' },
    { label: '💰 Earnings Simulator', path: '/contact' },
    { label: '📞 Business Contact', path: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-dark-800 border-t border-white/[0.06] pt-16 pb-8 overflow-hidden">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* Ambient glow */}
      <div className="blob blob-orange w-[500px] h-[300px] absolute -bottom-20 left-1/2 -translate-x-1/2 opacity-[0.06]" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
                <Car size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Renti</span>
                <span className="text-white">Go</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Rentigo is your trusted rental partner in India offering bikes, scooters, cars & taxis at affordable prices. Whether it's for tourism or daily travel, we provide reliable and hassle-free rental services.
            </p>
            <a
              href="https://wa.me/919687008865?text=Hi, I want to book a rental"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-all"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full block" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.quick.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-slate-400 text-sm hover:text-orange-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner Program */}
          <div>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full block" />
              Partner Program
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.partner.map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="text-slate-400 text-sm hover:text-orange-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 glass rounded-xl p-4">
              <p className="text-orange-400 font-semibold text-sm mb-1">Earn with RentiGo</p>
              <p className="text-slate-400 text-xs">List your vehicle and start earning today!</p>
              <Link to="/contact" className="inline-block mt-3 text-xs font-semibold text-white bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-all">
                Get Started →
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full block" />
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+919687008865" className="flex items-center gap-3 text-slate-400 text-sm hover:text-orange-400 transition-colors">
                  <Phone size={15} className="text-orange-500 shrink-0" />
                  +91 96870 08865
                </a>
              </li>
              <li>
                <a href="mailto:team@rentigo.in" className="flex items-center gap-3 text-slate-400 text-sm hover:text-orange-400 transition-colors">
                  <Mail size={15} className="text-orange-500 shrink-0" />
                  team@rentigo.in
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin size={15} className="text-orange-500 shrink-0" />
                Dwarka, Gujarat, India
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {[
                { href: 'https://www.facebook.com/rentigo', Icon: Facebook },
                { href: 'https://www.instagram.com/rentigo', Icon: Instagram },
                { href: 'https://twitter.com/rentigo', Icon: Twitter },
                { href: 'https://wa.me/919687008865', Icon: MessageCircle },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center sm:text-left">
            © 2026 Rentigo. All Rights Reserved.
          </p>
          <p className="text-slate-500 text-sm">
            Designed with ❤️ in Dwarka, Gujarat
          </p>
        </div>
      </div>
    </footer>
  );
}
