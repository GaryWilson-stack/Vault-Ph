import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_GAMES, CATEGORIES } from '../data/mockData';
import { Search, Zap, Gamepad2 } from 'lucide-react';

export const GamesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.publisher && game.publisher.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

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
            className="w-full h-12 pl-11 pr-4 bg-[#08152A] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchParams({});
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['All', ...CATEGORIES].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#1677FF] to-[#00CFFF] text-white shadow-[0_0_15px_rgba(0,207,255,0.3)]'
                  : 'bg-[#08152A] text-[#94A3B8] hover:text-white hover:bg-[#0B1D36] border border-[#0B1D36]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      </div>

      {/* Games Catalog Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.slug}`}
              className="group rounded-2xl bg-[#08152A] border border-[#0B1D36] hover:border-[#00CFFF]/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,207,255,0.2)] focus:outline-none"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#050B18] mb-3">
                  <img
                    src={game.logo_url}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152A] via-transparent to-transparent opacity-80" />

                  {game.badges && game.badges.length > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-[#050B18]/90 text-[#00CFFF] border border-[#00CFFF]/40">
                      {game.badges[0]}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {game.category}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#0B1D36]/80 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-[#94A3B8]">Starts at</div>
                  <div className="text-xs font-black text-white font-heading">
                    ₱{game.starting_price?.toFixed(2) ?? '10.00'}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-[#050B18] group-hover:bg-[#1677FF] border border-[#0B1D36] group-hover:border-[#1677FF] flex items-center justify-center transition-colors">
                  <Zap className="w-3.5 h-3.5 text-[#00CFFF] group-hover:text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-[#08152A] border border-[#0B1D36] p-8">
          <Gamepad2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white">No games found</h3>
          <p className="text-sm text-[#94A3B8] mt-1 max-w-sm mx-auto">
            We couldn't find any title matching "{searchTerm}". Try a different game name or browse all categories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSearchParams({});
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#1677FF] rounded-lg hover:bg-[#00CFFF] hover:text-[#050B18] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
