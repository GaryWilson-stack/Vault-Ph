import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Order, OrderFulfillmentStatus, OrderPaymentStatus, OrderStatus } from '../../types';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  X,
  Send
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal update state
  const [fulfillmentStatus, setFulfillmentStatus] = useState<OrderFulfillmentStatus>('PENDING');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('PROCESSING');
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>('PAID');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { orders: data } = await adminService.getAllOrders();
    setOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          (o.game_name && o.game_name.toLowerCase().includes(q)) ||
          (o.product_name && o.product_name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.fulfillment_status === statusFilter || o.payment_status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setFulfillmentStatus(order.fulfillment_status);
    setOrderStatus(order.order_status);
    setPaymentStatus(order.payment_status);
    setInternalNotes(order.internal_notes || '');
  };

  const handleSaveOrderStatus = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    await adminService.updateOrderStatus(selectedOrder.id, {
      fulfillment_status: fulfillmentStatus,
      order_status: orderStatus,
      payment_status: paymentStatus,
      internal_notes: internalNotes,
    });
    setSaving(false);
    setSelectedOrder(null);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">Review user top-up requests, verify credentials, and handle fulfillment</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-[#08152A] hover:bg-[#0B1D36] border border-white/10 rounded-xl text-sm font-semibold text-gray-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (e.g. VLT-...), email, or game..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#08152A] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1677FF]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-[#08152A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#1677FF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Fulfillment: COMPLETED</option>
            <option value="PENDING">Fulfillment: PENDING</option>
            <option value="PROCESSING">Fulfillment: PROCESSING</option>
            <option value="FAILED">Fulfillment: FAILED</option>
            <option value="MANUAL_REVIEW">Fulfillment: MANUAL REVIEW</option>
            <option value="PAID">Payment: PAID</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#08152A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#050B18] text-xs uppercase font-semibold text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Game & Denomination</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                    {loading ? 'Loading orders...' : 'No orders matched your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#00CFFF]">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{order.game_name}</div>
                      <div className="text-xs text-gray-400">{order.product_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-white">{order.email}</div>
                      <div className="text-gray-500">{order.payment_method.toUpperCase()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₱{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        order.payment_status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        order.fulfillment_status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : order.fulfillment_status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.fulfillment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenOrder(order)}
                        className="px-3 py-1.5 bg-[#1677FF]/10 hover:bg-[#1677FF]/20 text-[#00CFFF] border border-[#1677FF]/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#08152A] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Order</span>
                  <span className="font-mono text-[#00CFFF]">{selectedOrder.order_number}</span>
                </h2>
                <span className="text-xs text-gray-400">Created: {new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-game Customer Data (Dynamic Fields) */}
            <div className="bg-[#050B18] p-4 rounded-xl border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF] mb-3">
                Account Target Credentials
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(selectedOrder.customer_data || {}).map(([key, value]) => (
                  <div key={key} className="bg-[#08152A] p-2.5 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 block capitalize">{key.replace('_', ' ')}:</span>
                    <span className="font-mono font-bold text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items & Breakdown */}
            <div className="space-y-2 text-sm bg-[#050B18] p-4 rounded-xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-gray-400">Game / Service:</span>
                <span className="font-semibold text-white">{selectedOrder.game_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Item Denomination:</span>
                <span className="font-semibold text-white">{selectedOrder.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Channel:</span>
                <span className="font-semibold text-white">{selectedOrder.payment_method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-gray-400">Total Charged:</span>
                <span className="font-bold text-[#00CFFF] text-base">₱{Number(selectedOrder.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Status Overrides & Notes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fulfillment Status</label>
                  <select
                    value={fulfillmentStatus}
                    onChange={(e) => setFulfillmentStatus(e.target.value as OrderFulfillmentStatus)}
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as OrderPaymentStatus)}
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Internal Notes & Logs</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Sent via Moonton Partner API. Voucher pin: XXXX"
                  rows={3}
                  className="w-full p-3 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1677FF]"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSaveOrderStatus}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1677FF] hover:bg-[#1260d1] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1677FF]/25 transition"
              >
                <Send className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Order Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
