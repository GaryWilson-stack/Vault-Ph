import React from 'react';
import { useLocation } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-8 space-y-6">
        <h1 className="text-3xl font-black text-white font-heading">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Last Updated: September 2026 • VAULT PH Gaming Services
        </p>

        <div className="prose prose-invert text-sm text-[#94A3B8] space-y-4">
          <p>
            Welcome to VAULT PH. By accessing or using our game top-up platform, you agree to comply with and be bound by the following terms and operating conditions.
          </p>
          <h2 className="text-lg font-bold text-white font-heading">1. Digital Deliverables</h2>
          <p>
            All top-ups (diamonds, points, subscriptions, digital codes) are processed via authorized distribution protocols. Given the digital nature of instant game credits, orders that have been successfully fulfilled cannot be revoked or refunded once dispatched.
          </p>
          <h2 className="text-lg font-bold text-white font-heading">2. User Account Accuracy</h2>
          <p>
            Customers are solely responsible for providing exact and accurate User IDs, Zone IDs, or Server details. VAULT PH is not liable for credits dispatched to incorrect accounts entered by the customer.
          </p>
          <h2 className="text-lg font-bold text-white font-heading">3. Security and Non-Storage of Passwords</h2>
          <p>
            VAULT PH never requests, requires, or stores user passwords or payment PINs. All payment transactions are executed securely through accredited financial gateways (GCash, Maya, QR Ph).
          </p>
        </div>
      </div>
    </div>
  );
};
