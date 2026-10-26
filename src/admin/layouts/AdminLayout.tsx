import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gamepad2, 
  Layers, 
  Server,
  Sliders, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('vault_ph_admin_authenticated');
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Games Catalog', path: '/admin/games', icon: Gamepad2 },
    { name: 'Products & Tiers', path: '/admin/products', icon: Layers },
    { name: 'Eyad Supplier API', path: '/admin/supplier', icon: Server },
    { name: 'Settings & API', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#050B18] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#08152A] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] flex items-center justify-center font-bold text-sm">
            V
          </div>
          <span className="font-bold tracking-wider text-sm">VAULT PH <span className="text-[#00CFFF] text-xs font-mono ml-1">ADMIN</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#08152A] border-r border-white/5 flex flex-col flex-shrink-0 z-20`}
      >
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] flex items-center justify-center font-extrabold text-lg shadow-lg shadow-[#1677FF]/30">
            V
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wider text-white">VAULT PH</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1677FF]/20 text-[#00CFFF] border border-[#1677FF]/30 uppercase tracking-widest">
              Console
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1677FF] text-white shadow-lg shadow-[#1677FF]/25 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-[#00CFFF] hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Console</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#050B18] overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
