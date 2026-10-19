import { supabase } from '../lib/supabase';
import type { Order, OrderEvent } from '../types';

export interface CreateOrderInput {
  order_number: string;
  user_id?: string | null;
  email: string;
  phone?: string | null;
  game_id: string;
  game_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  payment_fee: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_reference?: string | null;
  customer_data: Record<string, string>;
}

export const ordersService = {
  /**
   * Insert a new order and initial event into Supabase
   * Requires an authenticated Supabase user session.
   */
  async createOrder(input: CreateOrderInput): Promise<{ order: Order | null; error: Error | null }> {
    try {
      // 1. Enforce active Supabase authentication session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.user) {
        return {
          order: null,
          error: new Error('Authentication required: Please sign in or create an account before placing an order.'),
        };
      }

      const authUser = sessionData.session.user;

      // 2. Prevent user impersonation: Always bind to authenticated user's ID
      const verifiedUserId = authUser.id;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: input.order_number,
          user_id: verifiedUserId,
          email: input.email || authUser.email || '',
          phone: input.phone || null,
          game_id: input.game_id,
          game_name: input.game_name,
          product_id: input.product_id,
          product_name: input.product_name,
          quantity: input.quantity,
          unit_price: input.unit_price,
          discount: input.discount,
          payment_fee: input.payment_fee,
          total: input.total,
          currency: input.currency,
          payment_method: input.payment_method,
          payment_reference: input.payment_reference || null,
          payment_status: 'PAID',
          fulfillment_status: 'COMPLETED',
          order_status: 'COMPLETED',
          customer_data: input.customer_data,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase order creation error:', error);
        return { order: null, error: new Error(error.message) };
      }

      // Create initial order events
      const eventsToInsert = [
        {
          order_id: data.id,
          order_number: data.order_number,
          status: 'Order Placed',
          message: 'Order created and payment initiated on VAULT PH checkout.',
        },
        {
          order_id: data.id,
          order_number: data.order_number,
          status: 'Payment Confirmed',
          message: `Payment confirmed via ${input.payment_method} (₱${input.total.toFixed(2)}).`,
        },
        {
          order_id: data.id,
          order_number: data.order_number,
          status: 'Fulfillment Completed',
          message: `Order fulfilled directly to in-game account.`,
        },
      ];

      await supabase.from('order_events').insert(eventsToInsert);

      return {
        order: {
          ...data,
          events: eventsToInsert.map((ev, i) => ({
            id: `ev-${i}`,
            order_id: data.id,
            status: ev.status,
            message: ev.message,
            created_at: new Date().toISOString(),
          })),
        },
        error: null,
      };
    } catch (err: unknown) {
      console.error('Unexpected error inserting order:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { order: null, error: new Error(msg) };
    }
  },

  /**
   * Fetch an order by order_number along with its timeline events
   * Uses secure track_order RPC first, with fallback to direct query
   */
  async getOrderByNumber(orderNumber: string): Promise<{ order: Order | null; error: Error | null }> {
    try {
      const trimmed = orderNumber.trim();

      // 1. Try secure RPC function (works for both guests and authenticated users)
      const { data: rpcData, error: rpcError } = await supabase.rpc('track_order', {
        p_order_number: trimmed,
      });

      if (!rpcError && rpcData) {
        return {
          order: rpcData as Order,
          error: null,
        };
      }

      // 2. Fallback to direct table query (for authenticated owners)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', trimmed)
        .maybeSingle();

      if (orderError) {
        return { order: null, error: new Error(orderError.message) };
      }

      if (!orderData) {
        return { order: null, error: null };
      }

      // Fetch events
      const { data: eventsData } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_number', orderData.order_number)
        .order('created_at', { ascending: true });

      const events: OrderEvent[] = (eventsData || []).map((e) => ({
        id: e.id,
        order_id: e.order_id,
        status: e.status,
        message: e.message,
        created_at: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      return {
        order: {
          ...orderData,
          events,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { order: null, error: new Error(msg) };
    }
  },

  /**
   * Fetch orders for authenticated user
   */
  async getUserOrders(userId: string): Promise<{ orders: Order[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { orders: [], error: new Error(error.message) };
      }

      return { orders: data || [], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { orders: [], error: new Error(msg) };
    }
  },
};
