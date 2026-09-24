import React from 'react';
import { ShieldCheck, Zap, Lock, Headphones, CreditCard, RefreshCw } from 'lucide-react';

export const WhyVault: React.FC = () => {
  const perks = [
    {
      title: 'Under 60s Fast Fulfillment',
      description: 'Our automated fulfillment engine communicates directly with game servers for rapid crediting.',
      icon: Zap,
      color: 'text-[#00CFFF]'
    },
    {
      title: 'Zero Passwords Required',
      description: 'We only ever request your public Player ID / UID. Your account credentials stay 100% in your hands.',
      icon: Lock,
      color: 'text-[#22C55E]'
    },
    {
      title: 'Trusted PH Payment Methods',
      description: 'Pay conveniently with GCash, Maya, ShopeePay, QR Ph, BDO, BPI, or debit/credit cards.',
      icon: CreditCard,
      color: 'text-[#1677FF]'
    },
    {
      title: '100% Official & Legal',
      description: 'All diamonds, passes, and points are procured through direct authorized regional distributors.',
      icon: ShieldCheck,
      color: 'text-[#00CFFF]'
    },
    {
      title: 'Live Order Tracking',
      description: 'Check real-time payment and API delivery status anytime with your order tracking number.',
      icon: RefreshCw,
      color: 'text-[#F59E0B]'
    },
    {
      title: '24/7 Filipino Gamer Support',
      description: 'Our dedicated local support team is ready to assist via live chat, email, or social channels.',
      icon: Headphones,
      color: 'text-[#EF4444]'
    }
  ];

  return (
    <section className="py-16 bg-[#08152A]/50 border-t border-[#0B1D36]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Why Filipino Gamers Choose <span className="text-[#00CFFF]">VAULT PH</span>
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-2">
            Built by competitive gamers for the Philippine gaming community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="rounded-2xl bg-[#050B18] border border-[#0B1D36] p-6 hover:border-[#1677FF]/40 transition-colors flex gap-4"
            >
              <div className="p-3 rounded-xl bg-[#08152A] border border-[#0B1D36] h-fit">
                <perk.icon className={`w-6 h-6 ${perk.color}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  {perk.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
