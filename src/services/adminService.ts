import { supabase } from '../lib/supabase';
import type { Order, Game, Product, ProductField, OrderStatus, OrderFulfillmentStatus, OrderPaymentStatus } from '../types';
import { MOCK_GAMES as initialGames, MOCK_PRODUCT_FIELDS, MOCK_PRODUCTS as initialProducts } from '../data/mockData';

// Flatten or convert initialProductFields to array
const initialProductFields: ProductField[] = Object.values(MOCK_PRODUCT_FIELDS).flat();

// Local storage keys for resilient persistence if Supabase credentials are in development/mock mode
const STORAGE_KEYS = {
  GAMES: 'vault_ph_admin_games',
  PRODUCTS: 'vault_ph_admin_products',
  FIELDS: 'vault_ph_admin_fields',
  ORDERS: 'vault_ph_admin_orders',
};

// Helper to initialize local storage cache
const getCachedData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setCachedData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const adminService = {
  // ===================== DASHBOARD METRICS =====================
  async getDashboardMetrics() {
    const ordersResult = await this.getAllOrders();
    const orders = ordersResult.orders || [];

    const totalRevenue = orders
      .filter((o) => o.payment_status === 'PAID')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.order_status === 'PENDING_PAYMENT' || o.fulfillment_status === 'PENDING').length;
    const completedOrders = orders.filter((o) => o.fulfillment_status === 'COMPLETED').length;
    const failedOrders = orders.filter((o) => o.fulfillment_status === 'FAILED' || o.order_status === 'FAILED').length;

    const gamesResult = await this.getAllGames();
    const productsResult = await this.getAllProducts();

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      totalGames: gamesResult.games.length,
      totalProducts: productsResult.products.length,
    };
  },

  // ===================== ORDERS MANAGEMENT =====================
  async getAllOrders(): Promise<{ orders: Order[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to locally tracked orders
        const localOrders = getCachedData<Order[]>(STORAGE_KEYS.ORDERS, []);
        return { orders: localOrders, error: null };
      }

      // Sync local cache
      setCachedData(STORAGE_KEYS.ORDERS, data as Order[]);
      return { orders: data as Order[], error: null };
    } catch {
      const localOrders = getCachedData<Order[]>(STORAGE_KEYS.ORDERS, []);
      return { orders: localOrders, error: null };
    }
  },

  async updateOrderStatus(
    orderId: string,
    updates: {
      order_status?: OrderStatus;
      fulfillment_status?: OrderFulfillmentStatus;
      payment_status?: OrderPaymentStatus;
      internal_notes?: string;
    }
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // 1. Try Supabase update
      const { error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // 2. Also log timeline event if status changed
      if (!error && (updates.order_status || updates.fulfillment_status)) {
        await supabase.from('order_events').insert({
          order_id: orderId,
          order_number: '',
          status: updates.fulfillment_status || updates.order_status || 'UPDATED',
          message: `Admin updated status to ${updates.fulfillment_status || updates.order_status}. Note: ${updates.internal_notes || 'None'}`,
        });
      }

      // 3. Update local cache
      const cached = getCachedData<Order[]>(STORAGE_KEYS.ORDERS, []);
      const updated = cached.map((o) => (o.id === orderId ? { ...o, ...updates, updated_at: new Date().toISOString() } : o));
      setCachedData(STORAGE_KEYS.ORDERS, updated);

      return { success: !error, error: error ? new Error(error.message) : null };
    } catch (err: any) {
      // Local fallback update
      const cached = getCachedData<Order[]>(STORAGE_KEYS.ORDERS, []);
      const updated = cached.map((o) => (o.id === orderId ? { ...o, ...updates, updated_at: new Date().toISOString() } : o));
      setCachedData(STORAGE_KEYS.ORDERS, updated);
      return { success: true, error: null };
    }
  },

  // ===================== GAMES MANAGEMENT =====================
  async getAllGames(): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data, error } = await supabase.from('games').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) {
        const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
        return { games: local, error: null };
      }
      setCachedData(STORAGE_KEYS.GAMES, data as Game[]);
      return { games: data as Game[], error: null };
    } catch {
      const local = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
      return { games: local, error: null };
    }
  },

  async saveGame(game: Game): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('games').upsert([game]);
      
      // Update local storage
      const cached = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
      const index = cached.findIndex((g) => g.id === game.id);
      let updated: Game[];
      if (index >= 0) {
        updated = [...cached];
        updated[index] = game;
      } else {
        updated = [...cached, game];
      }
      setCachedData(STORAGE_KEYS.GAMES, updated);

      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
      const index = cached.findIndex((g) => g.id === game.id);
      const updated = index >= 0 ? cached.map((g) => (g.id === game.id ? game : g)) : [...cached, game];
      setCachedData(STORAGE_KEYS.GAMES, updated);
      return { success: true, error: null };
    }
  },

  async deleteGame(gameId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      const cached = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
      setCachedData(STORAGE_KEYS.GAMES, cached.filter((g) => g.id !== gameId));
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<Game[]>(STORAGE_KEYS.GAMES, initialGames);
      setCachedData(STORAGE_KEYS.GAMES, cached.filter((g) => g.id !== gameId));
      return { success: true, error: null };
    }
  },

  // ===================== PRODUCTS MANAGEMENT =====================
  async getAllProducts(): Promise<{ products: Product[]; error: Error | null }> {
    try {
      const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) {
        const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        return { products: local, error: null };
      }
      setCachedData(STORAGE_KEYS.PRODUCTS, data as Product[]);
      return { products: data as Product[], error: null };
    } catch {
      const local = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      return { products: local, error: null };
    }
  },

  async saveProduct(product: Product): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('products').upsert([product]);
      const cached = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      const index = cached.findIndex((p) => p.id === product.id);
      const updated = index >= 0 ? cached.map((p) => (p.id === product.id ? product : p)) : [...cached, product];
      setCachedData(STORAGE_KEYS.PRODUCTS, updated);
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      const index = cached.findIndex((p) => p.id === product.id);
      const updated = index >= 0 ? cached.map((p) => (p.id === product.id ? product : p)) : [...cached, product];
      setCachedData(STORAGE_KEYS.PRODUCTS, updated);
      return { success: true, error: null };
    }
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      const cached = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      setCachedData(STORAGE_KEYS.PRODUCTS, cached.filter((p) => p.id !== productId));
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      setCachedData(STORAGE_KEYS.PRODUCTS, cached.filter((p) => p.id !== productId));
      return { success: true, error: null };
    }
  },

  // ===================== DYNAMIC FIELDS MANAGEMENT =====================
  async getAllProductFields(): Promise<{ fields: ProductField[]; error: Error | null }> {
    try {
      const { data, error } = await supabase.from('product_fields').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) {
        const local = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
        return { fields: local, error: null };
      }
      setCachedData(STORAGE_KEYS.FIELDS, data as ProductField[]);
      return { fields: data as ProductField[], error: null };
    } catch {
      const local = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
      return { fields: local, error: null };
    }
  },

  async saveProductField(field: ProductField): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('product_fields').upsert([field]);
      const cached = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
      const index = cached.findIndex((f) => f.id === field.id);
      const updated = index >= 0 ? cached.map((f) => (f.id === field.id ? field : f)) : [...cached, field];
      setCachedData(STORAGE_KEYS.FIELDS, updated);
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
      const index = cached.findIndex((f) => f.id === field.id);
      const updated = index >= 0 ? cached.map((f) => (f.id === field.id ? field : f)) : [...cached, field];
      setCachedData(STORAGE_KEYS.FIELDS, updated);
      return { success: true, error: null };
    }
  },

  async deleteProductField(fieldId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('product_fields').delete().eq('id', fieldId);
      const cached = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
      setCachedData(STORAGE_KEYS.FIELDS, cached.filter((f) => f.id !== fieldId));
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch {
      const cached = getCachedData<ProductField[]>(STORAGE_KEYS.FIELDS, initialProductFields);
      setCachedData(STORAGE_KEYS.FIELDS, cached.filter((f) => f.id !== fieldId));
      return { success: true, error: null };
    }
  },
};
