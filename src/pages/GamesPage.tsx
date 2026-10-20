import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, MOCK_GAMES } from '../data/mockData';
import { gamesService } from '../services/gamesService';
import type { Game } from '../types';
import { Search, Zap, Gamepad2, Loader2 } from 'lucide-react';

export const GamesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const data = await gamesService.getGames();
        if (data && data.length > 0) {
          setGames(data);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.publisher && game.publisher.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, selectedCategory]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          All Games & Top-Up Products
        </h1>
        <p className="text-sm sm:text-base text-[#94A3B8] mt-1">
          Select a title to view instant diamonds, credits, points, and game passes.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by game name, publisher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchParams(e.target.value ? { search: e.target.value } : {});
            }}
            className="w-full h-11 pl-11 pr-4 bg-[#08152A] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#1677FF] text-white shadow-[0_0_15px_rgba(22,119,255,0.4)]'
                : 'bg-[#08152A] text-gray-300 hover:text-white hover:bg-[#0B1D36] border border-[#0B1D36]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1677FF] text-white shadow-[0_0_15px_rgba(22,119,255,0.4)]'
                  : 'bg-[#08152A] text-gray-300 hover:text-white hover:bg-[#0B1D36] border border-[#0B1D36]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Games */}
      {loading && games.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-[#00CFFF]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20 bg-[#08152A]/40 rounded-2xl border border-[#0B1D36]">
          <Gamepad2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No Games Found</h3>
          <p className="text-sm text-[#94A3B8] max-w-sm mx-auto mb-4">
            We couldn't find any title matching "{searchTerm}". Try a different search keyword.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#00CFFF] bg-[#00CFFF]/10 border border-[#00CFFF]/20 rounded-xl hover:bg-[#00CFFF]/20"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.slug}`}
              className="group relative flex flex-col bg-[#08152A] border border-[#0B1D36] hover:border-[#00CFFF]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_-5px_rgba(0,207,255,0.2)]"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                <img
                  src={game.logo_url || game.banner_url}
                  alt={game.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder if broken image
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                
                {/* Instant Delivery Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#050B18]/80 backdrop-blur-md border border-[#00CFFF]/30 text-[10px] font-bold text-[#00CFFF]">
                  <Zap className="w-2.5 h-2.5 fill-[#00CFFF]" />
                  <span>Instant</span>
                </div>

                {/* Popular or Promo Badge */}
                {game.featured && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
                    Hot
                  </div>
                )}

                {/* Category tag */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-medium text-gray-300">
                  {game.category}
                </div>
              </div>

              {/* Title and Metadata */}
              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">
                    {game.publisher || 'Official Partner'}
                  </p>
                </div>
                
                <div className="mt-3 pt-2.5 border-t border-[#0B1D36] flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Available</span>
                  <span className="text-xs font-semibold text-[#00CFFF] group-hover:underline">Top Up &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
