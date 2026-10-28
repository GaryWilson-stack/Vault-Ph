/**
 * Eyad Store Service
 * Secure client-side service calling the backend proxy (/api/eyad)
 * Never contains API keys or secret credentials.
 */

export interface EyadCapabilityPolicy {
  name: string;
  mode: string;
  daily_cap_usd: number | null;
  observed_ip: string;
  ip_enforced: boolean;
}

export interface EyadCapabilitiesResponse {
  version: string;
  partner_policy: EyadCapabilityPolicy;
  products_types?: string[];
  [key: string]: any;
}

export interface EyadBalanceResponse {
  partner: string;
  balance_usd: number;
}

export interface EyadGame {
  id: string;
  name: string;
  requires_server: boolean;
  requires_zone: boolean;
  id_label?: string;
  zone_label?: string;
  server_label?: string;
  supports_id_check: boolean;
  servers?: Array<{ id: string; name: string }>;
  [key: string]: any;
}

export interface EyadPackage {
  id: string;
  name: string;
  price_usd: number;
  price_eur?: number;
  in_stock?: boolean;
  currency?: string;
  [key: string]: any;
}

export interface EyadValidationResult {
  valid: boolean;
  username?: string;
  nickname?: string;
  message?: string;
  [key: string]: any;
}

export interface EyadOrderPlacementParams {
  package_id: string | number;
  user_id: string;
  server?: string;
  zone_id?: string;
  payment_reference: string;
  max_charge_usd?: number;
}

export interface EyadOrderResponse {
  status: 'success' | 'failed' | 'pending' | 'processing';
  order_id?: string | number;
  charge_usd?: number;
  message?: string;
  [key: string]: any;
}

async function callEyadProxy<T>(endpoint: string, payload: Record<string, any> = {}): Promise<T> {
  const response = await fetch('/api/eyad', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint,
      ...payload
    })
  });

  if (!response.ok) {
    let errorMsg = `Eyad Store error (${response.status})`;
    try {
      const err = await response.json();
      errorMsg = err.error || err.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const eyadStoreService = {
  /**
   * Check account capabilities and observed IP status
   */
  async getCapabilities(): Promise<EyadCapabilitiesResponse> {
    return callEyadProxy<EyadCapabilitiesResponse>('capabilities');
  },

  /**
   * Get live reseller balance (USD)
   */
  async getBalance(): Promise<EyadBalanceResponse> {
    return callEyadProxy<EyadBalanceResponse>('balance');
  },

  /**
   * List all available games and required player fields
   */
  async getGames(): Promise<EyadGame[]> {
    const res = await callEyadProxy<{ games: EyadGame[] }>('games');
    return res.games || [];
  },

  /**
   * Fetch live packages and wholesale prices for a specific game
   * @param gameId Game ID e.g. "bloodstrike_ph", "genshin", "mlbb_adventure"
   */
  async getPackages(gameId: string): Promise<EyadPackage[]> {
    const res = await callEyadProxy<{ packages: EyadPackage[] }>('packages', { game: gameId });
    return res.packages || [];
  },

  /**
   * Validate a player ID before checkout
   * @param gameId Game ID
   * @param userId Player account identifier
   * @param server Optional server ID if requires_server is true
   * @param zoneId Optional zone ID if requires_zone is true
   */
  async validatePlayer(
    gameId: string,
    userId: string,
    server?: string,
    zoneId?: string
  ): Promise<EyadValidationResult> {
    const payload: Record<string, any> = {
      game: gameId,
      user_id: userId
    };
    if (server) payload.server = server;
    if (zoneId) payload.zone_id = zoneId;

    return callEyadProxy<EyadValidationResult>('validate', payload);
  },

  /**
   * Place an automated fulfillment order with Eyad Store
   * @param params EyadOrderPlacementParams
   */
  async placeOrder(params: EyadOrderPlacementParams): Promise<EyadOrderResponse> {
    return callEyadProxy<EyadOrderResponse>('order', params);
  },

  /**
   * Check status of a previously dispatched Eyad Store order
   * @param orderId Eyad order identifier
   */
  async getOrderStatus(orderId: string | number): Promise<any> {
    return callEyadProxy<any>('order/status', { order_id: orderId });
  }
};
