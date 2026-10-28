import React, { useState, useEffect } from 'react';
import { 
  Server, 
  RefreshCw, 
  DollarSign, 
  CheckCircle, 
  Globe, 
  Gamepad2, 
  Layers, 
  Search, 
  ShieldCheck,
  Zap,
  Info,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { 
  eyadStoreService, 
  type EyadCapabilitiesResponse, 
  type EyadGame, 
  type EyadPackage 
} from '../../services/eyadStoreService';

export const AdminSupplierPage: React.FC = () => {
  const [capabilities, setCapabilities] = useState<EyadCapabilitiesResponse | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [games, setGames] = useState<EyadGame[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Selected Game Packages
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<EyadGame | null>(null);
  const [packages, setPackages] = useState<EyadPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Dynamic Exchange Rate & Profit Margin Controls (persisted in localStorage)
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(() => {
    const saved = localStorage.getItem('vault_ph_fx_rate');
    return saved ? Number(saved) : 58.5;
  });

  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(() => {
    const saved = localStorage.getItem('vault_ph_profit_margin');
    return saved ? Number(saved) : 12; // Default 12% markup
  });

  const [paymentFeePercent, setPaymentFeePercent] = useState<number>(() => {
    const saved = localStorage.getItem('vault_ph_gateway_fee');
    return saved ? Number(saved) : 2.0; // Standard 2% gateway processing cost
  });

  const handleUpdateFxRate = (rate: number) => {
    setUsdToPhpRate(rate);
    localStorage.setItem('vault_ph_fx_rate', String(rate));
  };

  const handleUpdateProfitMargin = (margin: number) => {
    setProfitMarginPercent(margin);
    localStorage.setItem('vault_ph_profit_margin', String(margin));
  };

  const handleUpdatePaymentFee = (fee: number) => {
    setPaymentFeePercent(fee);
    localStorage.setItem('vault_ph_gateway_fee', String(fee));
  };

  const loadSupplierData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [capsRes, balRes, gamesRes] = await Promise.all([
        eyadStoreService.getCapabilities(),
        eyadStoreService.getBalance(),
        eyadStoreService.getGames()
      ]);

      setCapabilities(capsRes);
      setBalance(balRes.balance_usd);
      setGames(gamesRes);

      // Select first game if available
      if (gamesRes.length > 0 && !selectedGame) {
        const phGame = gamesRes.find(g => g.id.includes('_ph') || g.name.toLowerCase().includes('philippines')) || gamesRes[0];
        handleSelectGame(phGame);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Eyad Store supplier data.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSupplierData();
  }, []);

  const handleSelectGame = async (game: EyadGame) => {
    setSelectedGame(game);
    setLoadingPackages(true);
    try {
      const pkgs = await eyadStoreService.getPackages(game.id);
      setPackages(pkgs);
    } catch (err: any) {
      console.error('Failed to load packages for game:', game.id, err);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Filter games by search
  const filteredGames = games.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
            <Server className="w-6 h-6 text-[#00CFFF]" />
            Eyad Store Supplier Console
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time supplier connection, live wholesale rates, balance & regional catalogs.
          </p>
        </div>

        <button
          onClick={loadSupplierData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#08152A] hover:bg-[#0B1D36] border border-white/10 rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00CFFF]' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Live Rates'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="p-6 bg-[#08152A] border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reseller Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              ${balance !== null ? balance.toFixed(2) : '--'}
            </span>
            <span className="text-xs text-gray-400">USD</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400/80 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Active Partner Account ({capabilities?.partner_policy?.name || 'VaultPH'})
          </p>
        </div>

        {/* IP & Gateway Policy */}
        <div className="p-6 bg-[#08152A] border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gateway Policy</span>
            <div className="p-2 rounded-xl bg-[#1677FF]/10 text-[#00CFFF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-white flex items-center gap-2">
              Direct Serverless Mode
            </span>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span>IP Enforced:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {capabilities?.partner_policy?.ip_enforced ? 'Yes' : 'No (Dynamic Allowed)'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 truncate" title={capabilities?.partner_policy?.observed_ip}>
            Observed IP: {capabilities?.partner_policy?.observed_ip || 'Connected'}
          </p>
        </div>

        {/* Catalog Count */}
        <div className="p-6 bg-[#08152A] border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Games</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{games.length}</span>
            <span className="text-xs text-gray-400">Supplier Titles</span>
          </div>
          <p className="mt-2 text-xs text-cyan-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            Global & Regional PH Coverage
          </p>
        </div>
      </div>

      {/* Dynamic FX & Profit Margin Configuration Box */}
      <div className="p-6 bg-[#08152A] border border-[#00CFFF]/20 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00CFFF]/10 text-[#00CFFF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Controls: FX Rate & Profit Margins
              </h2>
              <p className="text-xs text-gray-400">
                Adjust benchmark conversion and retail markup rules. Automatically computes live suggested selling prices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Live Net Margin: +{profitMarginPercent}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* USD to PHP Exchange Rate */}
          <div className="bg-[#050B18] p-4 rounded-xl border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>USD ➔ PHP Exchange Rate</span>
              <span className="text-gray-500 font-mono">1 USD = ₱</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="50"
                max="75"
                value={usdToPhpRate}
                onChange={(e) => handleUpdateFxRate(Number(e.target.value) || 58.5)}
                className="w-full h-10 px-3 bg-[#08152A] border border-white/10 rounded-lg text-sm text-white font-mono font-bold focus:border-[#00CFFF] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                PHP
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Benchmark rate for wholesale conversion.</p>
          </div>

          {/* Retail Markup Margin */}
          <div className="bg-[#050B18] p-4 rounded-xl border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Target Profit Markup</span>
              <span className="text-emerald-400 font-mono font-bold">%{profitMarginPercent}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={profitMarginPercent}
                onChange={(e) => handleUpdateProfitMargin(Number(e.target.value) || 10)}
                className="w-full h-10 px-3 bg-[#08152A] border border-white/10 rounded-lg text-sm text-emerald-400 font-mono font-bold focus:border-[#00CFFF] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                %
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Your net retail profit percentage over cost.</p>
          </div>

          {/* Gateway Processing Cost */}
          <div className="bg-[#050B18] p-4 rounded-xl border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Gateway Overhead Buffer</span>
              <span className="text-yellow-400 font-mono font-bold">%{paymentFeePercent}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={paymentFeePercent}
                onChange={(e) => handleUpdatePaymentFee(Number(e.target.value) || 2.0)}
                className="w-full h-10 px-3 bg-[#08152A] border border-white/10 rounded-lg text-sm text-yellow-400 font-mono font-bold focus:border-[#00CFFF] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                %
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Buffer to cover GCash/Maya channel processing fees.</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Catalog & Pricing Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Game Selector */}
        <div className="lg:col-span-4 bg-[#08152A] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <span className="text-sm font-bold text-gray-300">Catalog Games ({filteredGames.length})</span>
            <span className="text-xs text-[#00CFFF]">Select to view packages</span>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search supplier games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050B18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00CFFF]"
            />
          </div>

          <div className="max-h-[550px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredGames.map((game) => {
              const isSelected = selectedGame?.id === game.id;
              const isPH = game.id.includes('_ph') || game.name.toLowerCase().includes('philippines');
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between text-xs ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#1677FF]/20 to-[#00CFFF]/20 border border-[#00CFFF]/40 text-white font-bold'
                      : 'bg-[#050B18]/50 hover:bg-[#050B18] border border-white/5 text-gray-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{game.name}</span>
                      {isPH && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-[#00CFFF] border border-blue-500/30 flex-shrink-0">
                          PH
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                      {game.id}
                    </span>
                  </div>

                  {game.supports_id_check && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0" title="Supports live ID validation">
                      ID Check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Wholesale Packages & Margins */}
        <div className="lg:col-span-8 bg-[#08152A] border border-white/5 rounded-2xl p-6">
          {selectedGame ? (
            <div>
              {/* Selected Game Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedGame.name}</h2>
                    <span className="px-2 py-0.5 text-xs font-mono bg-white/5 rounded text-gray-400">
                      ID: {selectedGame.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>
                      Required Fields: <strong className="text-white">{selectedGame.id_label || 'User ID'}</strong>
                      {selectedGame.requires_zone && (
                        <span> + <strong className="text-white">{selectedGame.zone_label || 'Zone ID'}</strong></span>
                      )}
                      {selectedGame.requires_server && (
                        <span> + <strong className="text-white">Server ({selectedGame.servers?.length || 0})</strong></span>
                      )}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span>
                      Player Validation: <strong className={selectedGame.supports_id_check ? 'text-emerald-400' : 'text-gray-400'}>
                        {selectedGame.supports_id_check ? 'Supported' : 'Not supported'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[#050B18] border border-white/5 text-xs text-gray-400 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>FX: 1 USD ≈ ₱{usdToPhpRate} | Margin: +{profitMarginPercent}%</span>
                </div>
              </div>

              {/* Package Table */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00CFFF]" />
                    Wholesale Packages ({packages.length})
                  </h3>
                  <span className="text-xs text-gray-500">Live Supplier Pricing</span>
                </div>

                {loadingPackages ? (
                  <div className="p-12 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#00CFFF]" />
                    <span>Fetching live packages from Eyad Store...</span>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="p-12 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-xl">
                    No packages returned for this game ID or service is temporarily offline.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider">
                          <th className="py-3 px-3">Package Name</th>
                          <th className="py-3 px-3">Package ID</th>
                          <th className="py-3 px-3 text-right">Wholesale (USD)</th>
                          <th className="py-3 px-3 text-right">Wholesale (PHP)</th>
                          <th className="py-3 px-3 text-right">Target Retail (PHP)</th>
                          <th className="py-3 px-3 text-right">Est. Profit (PHP)</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {packages.map((pkg) => {
                          const costPhp = pkg.price_usd * usdToPhpRate;
                          const totalMultiplier = 1 + (profitMarginPercent + paymentFeePercent) / 100;
                          // Round to nearest 5 pesos for clean commercial retail pricing
                          const suggestedRetailPhp = Math.ceil((costPhp * totalMultiplier) / 5) * 5;
                          const estNetProfitPhp = suggestedRetailPhp - costPhp - (suggestedRetailPhp * (paymentFeePercent / 100));

                          return (
                            <tr key={pkg.id} className="hover:bg-white/[0.02] transition">
                              <td className="py-3 px-3 font-semibold text-white">
                                {pkg.name}
                              </td>
                              <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                                {pkg.id}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[#00CFFF] font-bold">
                                ${pkg.price_usd.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-gray-300">
                                ₱{costPhp.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                                ₱{suggestedRetailPhp.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold">
                                +₱{estNetProfitPhp.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  pkg.in_stock !== false 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {pkg.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-gray-500">
              Select a game from the left sidebar to view wholesale packages and pricing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
