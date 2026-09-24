import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_ORDERS } from '../data/mockData';
import type { Order } from '../types';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const createDemoOrder = (orderNumber: string, email: string): Order => ({
  id: 'order-dynamic',
  order_number: orderNumber,
  email: email || 'customer@vaultph.com',
  game_id: 'game-mlbb',
  game_name: 'Mobile Legends: Bang Bang',
  product_id: 'prod-ml-wp',
  product_name: 'Weekly Diamond Pass',
  quantity: 1,
  unit_price: 99.00,
  discount: 0,
  payment_fee: 0,
  total: 99.00,
  currency: 'PHP',
  payment_method: 'GCash Instant',
  payment_reference: 'GCASH-SIM-94821',
  payment_status: 'PAID',
  fulfillment_status: 'COMPLETED',
  order_status: 'COMPLETED',
  customer_data: {
    'User ID': '34918234',
    'Zone ID': '3201'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  events: [
    {
      id: 'ev-1',
      order_id: 'order-dynamic',
      status: 'Order Placed',
      message: 'Order initiated securely on VAULT PH checkout.',
      created_at: 'Just now'
    },
    {
      id: 'ev-2',
      order_id: 'order-dynamic',
      status: 'Payment Confirmed',
      message: 'Payment received successfully via GCash.',
      created_at: 'Just now'
    },
    {
      id: 'ev-3',
      order_id: 'order-dynamic',
      status: 'Fulfillment Completed',
      message: 'Game diamonds / pass sent directly via official API.',
      created_at: 'Just now'
    }
  ]
});

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || '';
  const isNew = searchParams.get('new') === 'true';

  const [orderQuery, setOrderQuery] = useState(orderIdParam || 'VPH-2026-98124');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (orderIdParam) {
      const found = MOCK_ORDERS.find(
        (o) => o.order_number.toLowerCase() === orderIdParam.toLowerCase()
      );
      if (found) return found;
      if (orderIdParam.startsWith('VPH-')) {
        return createDemoOrder(orderIdParam, '');
      }
    }
    return null;
  });
  const [searched, setSearched] = useState<boolean>(() => Boolean(orderIdParam));
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (targetOrderNumber?: string) => {
    const query = (targetOrderNumber ?? orderQuery).trim();
    if (!query) return;

    setIsLoading(true);
    setSearched(true);

    setTimeout(() => {
      const found = MOCK_ORDERS.find(
        (o) => o.order_number.toLowerCase() === query.toLowerCase()
      );

      if (found) {
        setSearchedOrder(found);
      } else if (query.startsWith('VPH-')) {
        setSearchedOrder(createDemoOrder(query, ''));
      } else {
        setSearchedOrder(null);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Banner / Success alert for recent order placement */}
      {isNew && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-white flex items-start gap-3 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <CheckCircle2 className="w-6 h-6 text-[#22C55E] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">Order Placed Successfully!</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
              Your payment has been accepted and fulfillment has processed automatically. You can track all timeline updates below.
            </p>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00CFFF] uppercase tracking-wider mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-Time Status</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Track Your Top-Up Order
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Enter your VAULT PH Order Number to check live payment and in-game delivery progress.
        </p>
      </div>

      {/* Lookup Card Form */}
      <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 shadow-xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                VAULT PH Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. VPH-2026-98124"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              </div>
            </div>

            <div className="sm:col-span-4 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 px-6 font-bold text-sm text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tracking Results Area */}
      {searched && (
        searchedOrder ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Order Card Overview */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0B1D36] pb-5">
                <div>
                  <span className="text-xs text-[#94A3B8]">Order Reference</span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {searchedOrder.order_number}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {searchedOrder.fulfillment_status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1677FF]/20 text-[#00CFFF] border border-[#1677FF]/40">
                    {searchedOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Order Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#94A3B8]">Game</span>
                  <p className="font-semibold text-white mt-0.5">{searchedOrder.game_name}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Item / Package</span>
                  <p className="font-semibold text-white mt-0.5">{searchedOrder.product_name}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Total Amount</span>
                  <p className="font-bold text-[#00CFFF] font-heading text-base mt-0.5">₱{searchedOrder.total.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Payment Channel</span>
                  <p className="font-semibold text-white mt-0.5">{searchedOrder.payment_method}</p>
                </div>
              </div>

              {/* In-Game Account Delivered to */}
              <div className="p-4 rounded-xl bg-[#050B18] border border-[#0B1D36] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#94A3B8]">Delivered to In-Game Account:</span>
                  <div className="flex gap-4 font-mono font-bold text-white mt-1">
                    {Object.entries(searchedOrder.customer_data).map(([k, v]) => (
                      <span key={k}>
                        {k}: <span className="text-[#00CFFF]">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-[#94A3B8]">
                  Delivered via Official Moonton/Publisher API
                </div>
              </div>

              {/* Timeline (Per Spec Section 5 order_events & Section 22) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Order Event Timeline
                </h3>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#0B1D36]">
                  {searchedOrder.events?.map((ev, index) => (
                    <div key={ev.id || index} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#1677FF] border-2 border-[#08152A] shadow-[0_0_8px_rgba(22,119,255,0.8)]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ev.status}</span>
                          <span className="text-[10px] text-[#94A3B8]">{ev.created_at}</span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{ev.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Support CTA */}
            <div className="rounded-2xl bg-[#08152A]/60 border border-[#0B1D36] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#00CFFF] flex-shrink-0" />
                <span>Need assistance with this order or experiencing a delay?</span>
              </div>
              <a
                href="mailto:support@vaultph.com"
                className="px-4 py-2 font-bold text-white bg-[#0B1D36] hover:bg-[#1677FF] rounded-lg transition-colors whitespace-nowrap"
              >
                Contact 24/7 Support
              </a>
            </div>

          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-[#08152A] border border-[#0B1D36] p-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-white">Order Not Found</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-md mx-auto">
              We couldn't locate an order with number <span className="text-white font-mono">{orderQuery}</span>. Please verify the order reference code in your email receipt.
            </p>
          </div>
        )
      )}

    </div>
  );
};
