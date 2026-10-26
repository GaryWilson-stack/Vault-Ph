import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: any;
  method?: string;
  url?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

// Whitelist allowed read-only and safe endpoints to prevent arbitrary forwarding
const ALLOWED_ENDPOINTS = [
  'capabilities',
  'balance',
  'games',
  'packages',
  'validate',
  'products',
  'products/quote',
  'order/status',
  'services',
  'giftcards'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.EYAD_STORE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: EYAD_STORE_API_KEY is missing.' });
  }

  // Determine subpath from query (e.g. ?endpoint=games or ?endpoint=packages) or body
  const endpoint = (req.query?.endpoint as string) || req.body?.endpoint;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing endpoint parameter.' });
  }

  // Normalize endpoint string (remove leading slash)
  const cleanEndpoint = endpoint.replace(/^\/+/, '');

  if (!ALLOWED_ENDPOINTS.includes(cleanEndpoint)) {
    // Specifically block /order without explicit approval / backend safety check
    if (cleanEndpoint === 'order' || cleanEndpoint.includes('order')) {
      return res.status(403).json({
        error: 'Order placement via public proxy is restricted. Strict verification gate required.'
      });
    }
    return res.status(400).json({ error: `Endpoint '${cleanEndpoint}' is not allowed or supported.` });
  }

  try {
    const upstreamUrl = `https://reseller.eyadstore.gg/store/api/${cleanEndpoint}`;

    // Extract payload for upstream (remove proxy-only helper fields)
    const payload = { ...(req.body || {}) };
    delete payload.endpoint;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Key': apiKey,
        'User-Agent': 'VaultPH-Serverless/1.0'
      },
      body: JSON.stringify(payload)
    });

    const data = await upstreamResponse.json();

    return res.status(upstreamResponse.status).json(data);
  } catch (error: any) {
    console.error('Eyad Store Proxy Error:', error);
    return res.status(502).json({
      error: 'Failed to communicate with Eyad Store upstream API.',
      details: error.message
    });
  }
}
