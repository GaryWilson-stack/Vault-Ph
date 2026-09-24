import React from 'react';
import { Hero } from '../components/Hero';
import { PopularGames } from '../components/PopularGames';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { HowItWorks } from '../components/HowItWorks';
import { WhyVault } from '../components/WhyVault';
import { FAQPreview } from '../components/FAQPreview';
import { MOCK_GAMES, MOCK_PRODUCTS } from '../data/mockData';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-4">
      <Hero />
      <PopularGames games={MOCK_GAMES} />
      <FeaturedProducts products={MOCK_PRODUCTS} games={MOCK_GAMES} />
      <HowItWorks />
      <WhyVault />
      <FAQPreview />
    </div>
  );
};
