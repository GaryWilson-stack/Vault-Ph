import { supabase } from '../lib/supabase';
import type { Game, Product, ProductField } from '../types';
import { MOCK_GAMES, MOCK_PRODUCTS, MOCK_PRODUCT_FIELDS } from '../data/mockData';

const STORAGE_KEYS = {
  GAMES: 'vault_ph_admin_games',
  PRODUCTS: 'vault_ph_admin_products',
  FIELDS: 'vault_ph_admin_fields',
};

const getCachedData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const gamesService = {
  /**
   * Fetch all active games with fallback to local admin storage / mock data
   */
  async getGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, MOCK_GAMES);
        return local.filter((g) => g.active !== false);
      }

      return data as Game[];
    } catch {
      const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, MOCK_GAMES);
      return local.filter((g) => g.active !== false);
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
        const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, MOCK_GAMES);
        return local.find((g) => g.slug === slug);
      }

      return data as Game;
    } catch {
      const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, MOCK_GAMES);
      return local.find((g) => g.slug === slug);
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
        const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
        return local.filter((p) => p.game_id === gameId && p.active !== false);
      }

      return data as Product[];
    } catch {
      const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
      return local.filter((p) => p.game_id === gameId && p.active !== false);
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
        const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
        return local.filter((p) => p.featured && p.active !== false);
      }

      return data as Product[];
    } catch {
      const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
      return local.filter((p) => p.featured && p.active !== false);
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
        const localFields = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, []);
        const filtered = localFields.filter((f) => f.game_id === gameId);
        if (filtered.length > 0) return filtered;
        return MOCK_PRODUCT_FIELDS[gameId] || [];
      }

      return data as ProductField[];
    } catch {
      const localFields = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, []);
      const filtered = localFields.filter((f) => f.game_id === gameId);
      if (filtered.length > 0) return filtered;
      return MOCK_PRODUCT_FIELDS[gameId] || [];
    }
  },
};
