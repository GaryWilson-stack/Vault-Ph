import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Clock, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import heroBanner from '../assets/vault-hero-banner.jpg';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-4 pb-12 md:pt-6 md:pb-20">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#1677FF]/25 via-[#00CFFF]/20 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-[#1677FF]/15 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Top Hero Banner - Official VAULT PH Artwork (1942 x 809) */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#00CFFF]/30 bg-[#08152A] shadow-[0_0_40px_rgba(0,207,255,0.25)] group">
          <div className="relative aspect-[1942/809] w-full max-h-[500px]">
            <img
              src={heroBanner}
              alt="VAULT PH - Official Game Top-Up Banner"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
            />
            {/* Subtle Gradient Overlays for seamless blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B18] via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/40 via-transparent to-[#050B18]/40" />

            {/* Floating Top Badge */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#050B18]/85 backdrop-blur-md border border-[#00CFFF]/40 text-[11px] sm:text-xs font-bold text-[#00CFFF] shadow-lg">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CFFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00CFFF]"></span>
              </span>
              <span className="tracking-wide uppercase">Official Top-Up Partner</span>
            </div>

            {/* Quick Action Overlay on bottom of Banner for mobile/tablet */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#050B18]/70 backdrop-blur-md border border-[#0B1D36]/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] p-[2px]">
                  <div className="w-full h-full bg-[#050B18] rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#00CFFF]" />
                  </div>
                </div>
                <div>
                  <div className="text-white text-xs sm:text-sm font-bold font-heading flex items-center gap-1.5">
                    <span>Instant Game Diamonds & Passes</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#22C55E]/20 text-[#22C55E]">
                      Auto 60s
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    GCash • Maya • QR Ph • Direct UID reload with zero password required
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/games"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>TOP UP NOW</span>
                </Link>
                <Link
                  to="/track-order"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-200 bg-[#08152A] hover:bg-[#0B1D36] border border-[#0B1D36] rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Clock className="w-4 h-4 text-[#00CFFF]" />
                  <span>TRACK</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Content Row: Headline, Value Propositions & Trust Metrics */}
        <div className="grid lg:grid-cols-12 gap-8 items-center pt-2">
          
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-heading uppercase leading-[1.1]">
              Fastest & Most Reliable <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1677FF] via-[#00CFFF] to-white">
                Game Top-Up in the Philippines
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Direct server integrations for Mobile Legends diamonds, Valorant Points, Genshin Impact crystals, Roblox Robux, and Steam wallet codes. Fast checkout with trusted local payment channels.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                to="/games"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_25px_rgba(0,207,255,0.45)] transition-all transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>BROWSE ALL GAMES</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-gray-200 bg-[#08152A] hover:bg-[#0B1D36] border border-[#0B1D36] hover:border-[#00CFFF]/40 rounded-xl transition-all"
              >
                <Clock className="w-4 h-4 text-[#00CFFF]" />
                <span>TRACK EXISTING ORDER</span>
              </Link>
            </div>
          </div>

          {/* Value Proposition Highlights Box */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#050B18] border border-[#0B1D36] text-[#00CFFF]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Under 60s Fast Reload</div>
                  <div className="text-[11px] text-[#94A3B8]">Direct automated publisher API</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#050B18] border border-[#0B1D36] text-[#22C55E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">100% Safe Direct UID</div>
                  <div className="text-[11px] text-[#94A3B8]">We never ask for your password</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#050B18] border border-[#0B1D36] text-[#F59E0B]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Zero Hidden Charges</div>
                  <div className="text-[11px] text-[#94A3B8]">Direct PHP rates with GCash & Maya</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
