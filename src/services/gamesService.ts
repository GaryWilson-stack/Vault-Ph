import { supabase } from '../lib/supabase';
import type { Game, Product, ProductField } from '../types';
import { MOCK_GAMES, MOCK_PRODUCTS, MOCK_PRODUCT_FIELDS } from '../data/mockData';

export const gamesService = {
  /**
   * Fetch all active games with fallback to local mock data
   */
  async getGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_GAMES;
      }

      return data as Game[];
    } catch {
      return MOCK_GAMES;
    }
  },

  /**
   * Fetch game by slug with fallback
   */
  async getGameBySlug(slug: string): Promise<Game | undefined> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return MOCK_GAMES.find((g) => g.slug === slug);
      }

      return data as Game;
    } catch {
      return MOCK_GAMES.find((g) => g.slug === slug);
    }
  },

  /**
   * Fetch products for a specific game with fallback
   */
  async getGameProducts(gameId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('game_id', gameId)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_PRODUCTS.filter((p) => p.game_id === gameId);
      }

      return data as Product[];
    } catch {
      return MOCK_PRODUCTS.filter((p) => p.game_id === gameId);
    }
  },

  /**
   * Fetch featured products for home page with fallback
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_PRODUCTS.filter((p) => p.featured);
      }

      return data as Product[];
    } catch {
      return MOCK_PRODUCTS.filter((p) => p.featured);
    }
  },

  /**
   * Fetch dynamic product input fields for a specific game with fallback
   */
  async getGameProductFields(gameId: string): Promise<ProductField[]> {
    try {
      const { data, error } = await supabase
        .from('product_fields')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_PRODUCT_FIELDS[gameId] || [];
      }

      return data as ProductField[];
    } catch {
      return MOCK_PRODUCT_FIELDS[gameId] || [];
    }
  },
};
