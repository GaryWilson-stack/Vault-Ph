import React from 'react';
import { Gamepad2, UserCheck, CreditCard, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Select Game & Product',
      description: 'Choose your desired game and denomination, package, or seasonal pass.',
      icon: Gamepad2,
      accent: 'from-[#1677FF] to-[#00CFFF]'
    },
    {
      step: '02',
      title: 'Enter Account Info',
      description: 'Provide your User ID, Zone ID, or Riot ID. No password or sensitive credentials required.',
      icon: UserCheck,
      accent: 'from-[#00CFFF] to-[#22C55E]'
    },
    {
      step: '03',
      title: 'Instant Payment & Reload',
      description: 'Pay instantly via GCash, Maya, QR Ph, or card. Your game account is automatically credited.',
      icon: CreditCard,
      accent: 'from-[#22C55E] to-[#1677FF]'
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00CFFF] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast & Straightforward</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
            How Top-Up Works on VAULT PH
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-2">
            Automated API fulfillment credits your account within 60 seconds without logging into your account.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 hover:border-[#00CFFF]/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.accent} p-0.5 shadow-md`}>
                  <div className="w-full h-full bg-[#050B18] rounded-[10px] flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#00CFFF]" />
                  </div>
                </div>
                <span className="text-3xl font-black text-[#0B1D36] font-heading">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
