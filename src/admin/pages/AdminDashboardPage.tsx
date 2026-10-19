import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Gamepad2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import type { Order } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalGames: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
      const ordersRes = await adminService.getAllOrders();
      setRecentOrders((ordersRes.orders || []).slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Gross Revenue',
      value: `₱${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Total Top-Ups',
      value: metrics.totalOrders,
      icon: ShoppingBag,
      color: 'from-[#1677FF]/20 to-[#00CFFF]/10 text-[#00CFFF] border-[#1677FF]/30',
    },
    {
      title: 'Pending Fulfillment',
      value: metrics.pendingOrders,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Delivered Orders',
      value: metrics.completedOrders,
      icon: CheckCircle2,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
    },
    {
      title: 'Failed / Review',
      value: metrics.failedOrders,
      icon: XCircle,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Operations Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Live metrics, catalog health, and order fulfillment tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-[#08152A] hover:bg-[#0B1D36] border border-white/10 rounded-xl text-sm font-semibold text-gray-200 hover:text-white transition"
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/games"
            className="px-4 py-2 bg-[#1677FF] hover:bg-[#1260d1] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1677FF]/25 transition"
          >
            + Add New Game
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-[#08152A] border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between ${card.color.split(' ').slice(2).join(' ')}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.title}</span>
                <div className={`p-2 rounded-xl bg-white/5 ${card.color.split(' ')[2]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{loading ? '...' : card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Catalog Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#08152A] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00CFFF] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Active Games</h3>
              <p className="text-xs text-gray-400">Total gaming titles published on marketplace</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{metrics.totalGames}</span>
            <Link to="/admin/games" className="block text-xs text-[#00CFFF] hover:underline mt-1">
              View Games →
            </Link>
          </div>
        </div>

        <div className="bg-[#08152A] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Top-Up Denominations</h3>
              <p className="text-xs text-gray-400">Product SKUs and pricing tiers configured</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{metrics.totalProducts}</span>
            <Link to="/admin/products" className="block text-xs text-purple-400 hover:underline mt-1">
              Configure SKUs →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#08152A] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Top-Up Transactions</h2>
            <p className="text-xs text-gray-400">Latest orders placed across Philippine payment channels</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-[#00CFFF] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No recent orders recorded yet. Place an order on the storefront to test live tracking!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#050B18] text-xs uppercase font-semibold text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Game / Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#00CFFF]">{order.order_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{order.game_name || 'Game'}</div>
                      <div className="text-xs text-gray-400">{order.product_name}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div>{order.email}</div>
                      <div className="text-gray-500">{order.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">₱{Number(order.total).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        order.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        order.fulfillment_status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.fulfillment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
