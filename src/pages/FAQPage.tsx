import React from 'react';
import { FAQPreview } from '../components/FAQPreview';
import { Mail, MessageSquare, Headphones } from 'lucide-react';

export const FAQPage: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Help & Support Center
        </h1>
        <p className="text-sm text-[#94A3B8] mt-2">
          Find instant answers to top-up, payment, and account delivery questions.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#1677FF]/15 text-[#00CFFF] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Live Chat Support</h3>
          <p className="text-xs text-[#94A3B8]">
            Talk to a Filipino gaming support specialist 24/7.
          </p>
          <button className="px-4 py-2 text-xs font-bold text-white bg-[#1677FF] rounded-lg hover:bg-[#00CFFF] hover:text-[#050B18] transition-colors">
            Start Chat
          </button>
        </div>

        <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Email Support</h3>
          <p className="text-xs text-[#94A3B8]">
            Response typically within 15-30 minutes.
          </p>
          <a
            href="mailto:support@vaultph.com"
            className="inline-block px-4 py-2 text-xs font-bold text-white bg-[#0B1D36] hover:bg-[#1677FF] rounded-lg transition-colors"
          >
            support@vaultph.com
          </a>
        </div>

        <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center mx-auto">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Order Assistance</h3>
          <p className="text-xs text-[#94A3B8]">
            Need help checking an existing payment receipt?
          </p>
          <a
            href="/track-order"
            className="inline-block px-4 py-2 text-xs font-bold text-white bg-[#0B1D36] hover:bg-[#1677FF] rounded-lg transition-colors"
          >
            Track Order Now
          </a>
        </div>
      </div>

      <FAQPreview />
    </div>
  );
};
