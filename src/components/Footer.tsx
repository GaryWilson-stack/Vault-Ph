import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ShieldCheck, Mail, MessageSquare, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050B18] border-t border-[#0B1D36] text-[#94A3B8] text-xs pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] p-[2px]">
                <div className="w-full h-full bg-[#050B18] rounded-[10px] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-[#00CFFF]" />
                </div>
              </div>
              <span className="text-xl font-black text-white font-heading">
                VAULT <span className="text-[#00CFFF]">PH</span>
              </span>
            </Link>

            <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
              VAULT PH is the premier top-up platform for gamers across the Philippines. Fast, secure, and officially licensed digital game credits and gift cards delivered right when you need them.
            </p>

            <div className="flex items-center gap-3 text-white">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-[#08152A] border border-[#0B1D36] hover:border-[#00CFFF] flex items-center justify-center hover:text-[#00CFFF] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@vaultph.com"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-[#08152A] border border-[#0B1D36] hover:border-[#00CFFF] flex items-center justify-center hover:text-[#00CFFF] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Top-Ups</div>
            <ul className="space-y-2">
              <li>
                <Link to="/games/mobile-legends" className="hover:text-white transition-colors">
                  Mobile Legends Diamonds
                </Link>
              </li>
              <li>
                <Link to="/games/valorant" className="hover:text-white transition-colors">
                  Valorant Points (VP)
                </Link>
              </li>
              <li>
                <Link to="/games/genshin-impact" className="hover:text-white transition-colors">
                  Genshin Impact Crystals
                </Link>
              </li>
              <li>
                <Link to="/games/roblox" className="hover:text-white transition-colors">
                  Roblox Robux
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-[#00CFFF] hover:underline">
                  View All Games →
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</div>
            <ul className="space-y-2">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ & Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="#payment-methods" className="hover:text-white transition-colors">
                  Payment Channels
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Legal & Trust</div>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-[#22C55E]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SSL Encrypted Checkout</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment Methods Banner */}
        <div className="pt-8 border-t border-[#0B1D36] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-400 mr-2">Official Payment Gateways:</span>
            {['GCash', 'Maya', 'QR Ph', 'GrabPay', 'ShopeePay', 'Visa / Mastercard', 'BDO', 'BPI'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded bg-[#08152A] border border-[#0B1D36] text-[11px] font-medium text-gray-300"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="text-[11px] text-[#94A3B8] text-center md:text-right">
            Philippines 🇵🇭 • PHP Currency
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-4 border-t border-[#0B1D36]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <div>
            © {new Date().getFullYear()} VAULT PH. All rights reserved. Not affiliated with or endorsed by Moonton, Riot Games, or HoYoverse.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted for Filipino Gamers</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
