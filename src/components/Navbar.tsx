import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Gamepad2, 
  Search, 
  Clock, 
  Menu, 
  X, 
  ChevronRight,
  Flame,
  User,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuthModal, signOut } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) onSearch(searchQuery);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Games', path: '/games', badge: 'Hot' },
    { label: 'Track Order', path: '/track-order', icon: Clock },
    { label: 'Support', path: '/faq' },
  ];

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('admin') || localStorage.getItem('vault_ph_admin_authenticated') === 'true';

  return (
    <header className="sticky top-0 z-50 bg-[#050B18]/90 backdrop-blur-md border-b border-[#0B1D36]/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(0,207,255,0.4)]">
              <div className="w-full h-full bg-[#050B18] rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-[#00CFFF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider text-white font-heading">VAULT</span>
                <span className="px-1.5 py-0.5 text-xs font-black tracking-wide bg-gradient-to-r from-[#1677FF] to-[#00CFFF] text-white rounded">PH</span>
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-[#94A3B8] -mt-1 uppercase">Game Top-Up</span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search games, diamonds, vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-[#08152A] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive 
                      ? 'text-[#00CFFF] bg-[#08152A] border border-[#0B1D36]' 
                      : 'text-gray-300 hover:text-white hover:bg-[#08152A]/50'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                  {item.badge && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      <Flame className="w-2.5 h-2.5 fill-red-400" />
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 ml-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/track-order"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#08152A] hover:bg-[#0B1D36] border border-[#0B1D36] hover:border-[#1677FF]/40 text-gray-200 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#00CFFF]" />
              <span>Track Order</span>
            </Link>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline text-xs text-gray-300 truncate max-w-[120px]">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#08152A] hover:bg-red-500/20 border border-[#0B1D36] hover:border-red-500/30 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#08152A] hover:bg-[#0B1D36] border border-[#0B1D36] hover:border-[#00CFFF]/40 text-gray-200 hover:text-[#00CFFF] transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              to="/games"
              className="inline-flex items-center justify-center h-9 sm:h-10 px-3.5 sm:px-5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Top Up
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#08152A] border border-[#0B1D36] text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search & Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#0B1D36] bg-[#050B18] px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search games, diamonds, vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-[#08152A] border border-[#0B1D36] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#00CFFF]"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#08152A]/60 hover:bg-[#08152A] text-gray-200 text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon className="w-4 h-4 text-[#00CFFF]" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold border border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Console</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </Link>
            )}

            <div className="pt-2 border-t border-[#0B1D36]/80 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.email?.split('@')[0]})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#08152A] hover:bg-[#0B1D36] text-[#00CFFF] text-sm font-medium border border-[#00CFFF]/30"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
