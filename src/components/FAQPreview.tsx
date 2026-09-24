import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQPreview: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How fast will my game diamonds or points arrive?',
      a: 'Top-ups are automated through official API integrations. 98% of orders are completed within 30 to 60 seconds after your payment is confirmed by GCash, Maya, or your chosen method.'
    },
    {
      q: 'Do I need to give you my game account password?',
      a: 'Never! We will NEVER ask for your password, email login credentials, or verification codes (OTP). All you need to provide is your public User ID / Zone ID / UID.'
    },
    {
      q: 'What payment methods do you support in the Philippines?',
      a: 'We accept GCash, Maya, QR Ph (accessible via any PH banking app like BDO, BPI, UnionBank), GrabPay, ShopeePay, and major Visa/Mastercard credit and debit cards.'
    },
    {
      q: 'What should I do if my top-up hasn’t arrived yet?',
      a: 'First, check your order status using our "Track Order" page with your Order Number. If the status is PAID but fulfillment is still processing, please allow 3-5 minutes for server sync or reach out to our 24/7 support team with your receipt.'
    },
    {
      q: 'How can I reach VAULT PH customer support?',
      a: 'You can contact our support team 24/7 via the Support link on our website, or message our official Facebook page or email us at support@vaultph.com.'
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00CFFF] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-black text-white font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Everything you need to know about top-ups on VAULT PH.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl bg-[#08152A] border border-[#0B1D36] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#00CFFF] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-t border-[#0B1D36]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
