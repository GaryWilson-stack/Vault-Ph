import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { PopularGames } from '../components/PopularGames';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { HowItWorks } from '../components/HowItWorks';
import { WhyVault } from '../components/WhyVault';
import { FAQPreview } from '../components/FAQPreview';
import { gamesService } from '../services/gamesService';
import type { Game, Product } from '../types';
import { MOCK_GAMES, MOCK_PRODUCTS } from '../data/mockData';

export const HomePage: React.FC = () => {
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    const loadStorefront = async () => {
      try {
        const [activeGames, featured] = await Promise.all([
          gamesService.getGames(),
          gamesService.getFeaturedProducts(),
        ]);
        if (activeGames && activeGames.length > 0) {
          setGames(activeGames);
        }
        if (featured && featured.length > 0) {
          setFeaturedProducts(featured);
        }
      } catch (err) {
        console.warn('Using cached mock data on home page:', err);
      }
    };

    loadStorefront();
  }, []);

  return (
    <div className="space-y-4">
      <Hero />
      <PopularGames games={games} />
      <FeaturedProducts products={featuredProducts} games={games} />
      <HowItWorks />
      <WhyVault />
      <FAQPreview />
    </div>
  );
};
