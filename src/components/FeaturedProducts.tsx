import React from 'react';
import { Link } from 'react-router-dom';
import type { Product, Game } from '../types';
import { Zap, Flame } from 'lucide-react';


interface FeaturedProductsProps {
  products: Product[];
  games: Game[];
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, games }) => {
  const getGame = (gameId: string) => games.find((g) => g.id === gameId);

  return (
    <section className="py-12 bg-[#08152A]/40 border-y border-[#0B1D36]/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 fill-red-400" />
              <span>Special Promos & Passes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Featured Top-Up Deals
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Prices inclusive of Philippine local processing
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => {
            const game = getGame(product.game_id);
            return (
              <div
                key={product.id}
                className="group rounded-2xl bg-[#08152A] border border-[#0B1D36] hover:border-[#1677FF]/60 p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(22,119,255,0.2)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      {game && (
                        <img
                          src={game.logo_url}
                          alt={game.name}
                          className="w-9 h-9 rounded-lg object-cover border border-[#0B1D36]"
                        />
                      )}
                      <div>
                        <div className="text-[11px] text-[#94A3B8] font-medium truncate max-w-[140px]">
                          {game?.name ?? 'Top-Up'}
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {product.bonus_text && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                        {product.bonus_text}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#94A3B8] mb-4 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#0B1D36] flex items-center justify-between">
                  <div>
                    {product.discount_price ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-[#00CFFF] font-heading">
                          ₱{product.discount_price.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#94A3B8] line-through">
                          ₱{product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-white font-heading">
                        ₱{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/games/${game?.slug ?? 'mobile-legends'}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1677FF] hover:bg-[#00CFFF] hover:text-[#050B18] rounded-lg transition-colors"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Select</span>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
