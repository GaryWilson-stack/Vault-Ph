import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { Zap, ChevronRight, Sparkles } from 'lucide-react';

interface PopularGamesProps {
  games: Game[];
  title?: string;
  subtitle?: string;
}

export const PopularGames: React.FC<PopularGamesProps> = ({
  games,
  title = "Popular Games & Platforms",
  subtitle = "Instant automated reloads directly credited to your account"
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Mobile Games', 'PC Games', 'Gift Cards', 'Game Points'];

  const filteredGames = selectedCategory === 'All'
    ? games
    : games.filter(g => g.category === selectedCategory);

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00CFFF] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Top-Up Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] mt-1">
              {subtitle}
            </p>
          </div>

          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00CFFF] hover:text-white transition-colors group"
          >
            <span>View All ({games.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#1677FF] to-[#00CFFF] text-white shadow-[0_0_15px_rgba(0,207,255,0.3)]'
                  : 'bg-[#08152A] text-[#94A3B8] hover:text-white hover:bg-[#0B1D36] border border-[#0B1D36]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.slug}`}
              className="group relative rounded-2xl bg-[#08152A] border border-[#0B1D36] hover:border-[#00CFFF]/60 p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,207,255,0.2)] focus:outline-none"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#050B18] mb-3">
                  <img
                    src={game.logo_url}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152A]/90 via-transparent to-transparent opacity-80" />

                  {/* Badge */}
                  {game.badges && game.badges.length > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-[#050B18]/90 text-[#00CFFF] border border-[#00CFFF]/40">
                      {game.badges[0]}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {game.category}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-tight">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Price & CTA Footer */}
              <div className="mt-4 pt-3 border-t border-[#0B1D36]/80 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-[#94A3B8]">Starts at</div>
                  <div className="text-xs font-black text-white font-heading">
                    ₱{game.starting_price?.toFixed(2) ?? '10.00'}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-[#050B18] group-hover:bg-[#1677FF] border border-[#0B1D36] group-hover:border-[#1677FF] flex items-center justify-center transition-colors">
                  <Zap className="w-3.5 h-3.5 text-[#00CFFF] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
