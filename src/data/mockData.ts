import type { Game, Product, ProductField, ProductCategory, Order } from '../types';

export const CATEGORIES: ProductCategory[] = [
  'Mobile Games',
  'PC Games',
  'Console',
  'Gift Cards',
  'Subscriptions',
  'Game Points'
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'game-mlbb',
    name: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    description: 'Fast, secure MLBB diamonds & weekly passes direct to your Moonton account.',
    logo_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    category: 'Mobile Games',
    active: true,
    featured: true,
    sort_order: 1,
    publisher: 'Moonton',
    starting_price: 10,
    badges: ['Instant', 'Most Popular']
  },
  {
    id: 'game-valorant',
    name: 'Valorant',
    slug: 'valorant',
    description: 'Riot Points & Valorant Points (VP) delivered instantly to PH/SEA servers.',
    logo_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    category: 'PC Games',
    active: true,
    featured: true,
    sort_order: 2,
    publisher: 'Riot Games',
    starting_price: 150,
    badges: ['Official Codes']
  },
  {
    id: 'game-genshin',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    description: 'Blessing of the Welkin Moon and Genesis Crystals direct UID top-up.',
    logo_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    category: 'Mobile Games',
    active: true,
    featured: true,
    sort_order: 3,
    publisher: 'HoYoverse',
    starting_price: 50,
    badges: ['Direct UID']
  },
  {
    id: 'game-roblox',
    name: 'Roblox',
    slug: 'roblox',
    description: 'Official Roblox Robux gift cards and digital voucher codes.',
    logo_url: 'https://images.unsplash.com/photo-1612287233207-e17f0cb4fa68?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    category: 'Game Points',
    active: true,
    featured: true,
    sort_order: 4,
    publisher: 'Roblox Corp',
    starting_price: 250,
    badges: ['Voucher']
  },
  {
    id: 'game-codm',
    name: 'Call of Duty: Mobile',
    slug: 'call-of-duty-mobile',
    description: 'Garena COD Points (CP) top-up via OpenID with instant in-game crediting.',
    logo_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    category: 'Mobile Games',
    active: true,
    featured: false,
    sort_order: 5,
    publisher: 'Garena / Activision',
    starting_price: 20,
    badges: ['Garena Direct']
  },
  {
    id: 'game-steam',
    name: 'Steam Wallet PHP',
    slug: 'steam-wallet',
    description: 'PHP denominated Steam digital codes. Redeemable on all PH Steam accounts.',
    logo_url: 'https://images.unsplash.com/photo-1618193139062-2c5bf4f935b7?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    category: 'Gift Cards',
    active: true,
    featured: false,
    sort_order: 6,
    publisher: 'Valve',
    starting_price: 50,
    badges: ['Instant Code']
  }
];

export const MOCK_PRODUCT_FIELDS: Record<string, ProductField[]> = {
  'game-mlbb': [
    {
      id: 'field-ml-user',
      game_id: 'game-mlbb',
      field_name: 'user_id',
      field_label: 'User ID',
      field_type: 'number',
      placeholder: 'e.g. 12345678',
      required: true,
      validation_rules: {
        helperText: 'Your 8-10 digit User ID found in profile settings.'
      },
      sort_order: 1
    },
    {
      id: 'field-ml-zone',
      game_id: 'game-mlbb',
      field_name: 'zone_id',
      field_label: 'Zone ID',
      field_type: 'number',
      placeholder: 'e.g. 1234',
      required: true,
      validation_rules: {
        helperText: '4-5 digit number inside parentheses next to User ID.'
      },
      sort_order: 2
    }
  ],
  'game-valorant': [
    {
      id: 'field-val-riotid',
      game_id: 'game-valorant',
      field_name: 'riot_id',
      field_label: 'Riot ID & Tagline',
      field_type: 'text',
      placeholder: 'e.g. Phoenix#PH1',
      required: true,
      validation_rules: {
        helperText: 'Include your hashtag and tagline.'
      },
      sort_order: 1
    }
  ],
  'game-genshin': [
    {
      id: 'field-gi-uid',
      game_id: 'game-genshin',
      field_name: 'uid',
      field_label: 'Genshin UID',
      field_type: 'number',
      placeholder: 'e.g. 800123456',
      required: true,
      validation_rules: {
        helperText: 'Your 9-digit in-game UID displayed at bottom right.'
      },
      sort_order: 1
    },
    {
      id: 'field-gi-server',
      game_id: 'game-genshin',
      field_name: 'server',
      field_label: 'Server Region',
      field_type: 'select',
      placeholder: 'Select Server',
      required: true,
      validation_rules: {
        options: [
          { label: 'Asia', value: 'asia' },
          { label: 'America', value: 'america' },
          { label: 'Europe', value: 'europe' },
          { label: 'TW/HK/MO', value: 'tw_hk_mo' }
        ]
      },
      sort_order: 2
    }
  ],
  'game-roblox': [
    {
      id: 'field-roblox-username',
      game_id: 'game-roblox',
      field_name: 'roblox_username',
      field_label: 'Roblox Username',
      field_type: 'text',
      placeholder: 'Enter your Roblox Username',
      required: true,
      validation_rules: {
        helperText: 'Do not enter your display name; enter the unique @handle.'
      },
      sort_order: 1
    }
  ],
  'game-codm': [
    {
      id: 'field-codm-openid',
      game_id: 'game-codm',
      field_name: 'openid',
      field_label: 'CODM OpenID',
      field_type: 'text',
      placeholder: 'Enter Garena OpenID',
      required: true,
      validation_rules: {
        helperText: 'Found under Settings > Legal and Privacy in CODM.'
      },
      sort_order: 1
    }
  ],
  'game-steam': [
    {
      id: 'field-steam-email',
      game_id: 'game-steam',
      field_name: 'delivery_email',
      field_label: 'Recipient Email Address',
      field_type: 'email',
      placeholder: 'your-email@example.com',
      required: true,
      validation_rules: {
        helperText: 'The Steam wallet digital key will be emailed here.'
      },
      sort_order: 1
    }
  ]
};

export const MOCK_PRODUCTS: Product[] = [
  // MLBB
  {
    id: 'prod-ml-50',
    game_id: 'game-mlbb',
    name: '50 + 5 Bonus Diamonds',
    slug: '55-diamonds',
    description: 'Instant reload via Moonton direct API.',
    product_type: 'Diamonds',
    denomination: '55 Diamonds',
    price: 49.00,
    discount_price: 45.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 1,
    delivery_type: 'instant_api',
    bonus_text: '+5 Bonus'
  },
  {
    id: 'prod-ml-wp',
    game_id: 'game-mlbb',
    name: 'Weekly Diamond Pass',
    slug: 'weekly-diamond-pass',
    description: 'Best value! 210 diamonds total + rewards over 7 days.',
    product_type: 'Pass',
    denomination: '1 Pass',
    price: 110.00,
    discount_price: 99.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 2,
    delivery_type: 'instant_api',
    bonus_text: 'HOT DEAL'
  },
  {
    id: 'prod-ml-250',
    game_id: 'game-mlbb',
    name: '250 + 25 Bonus Diamonds',
    slug: '275-diamonds',
    description: 'Instant reload via Moonton direct API.',
    product_type: 'Diamonds',
    denomination: '275 Diamonds',
    price: 245.00,
    discount_price: 225.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 3,
    delivery_type: 'instant_api',
    bonus_text: '+25 Bonus'
  },
  {
    id: 'prod-ml-500',
    game_id: 'game-mlbb',
    name: '500 + 65 Bonus Diamonds',
    slug: '565-diamonds',
    description: 'Instant reload via Moonton direct API.',
    product_type: 'Diamonds',
    denomination: '565 Diamonds',
    price: 490.00,
    discount_price: 450.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: false,
    sort_order: 4,
    delivery_type: 'instant_api',
    bonus_text: '+65 Bonus'
  },
  {
    id: 'prod-ml-1000',
    game_id: 'game-mlbb',
    name: '1000 + 155 Bonus Diamonds',
    slug: '1155-diamonds',
    description: 'Instant reload via Moonton direct API.',
    product_type: 'Diamonds',
    denomination: '1155 Diamonds',
    price: 980.00,
    discount_price: 899.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: false,
    sort_order: 5,
    delivery_type: 'instant_api',
    bonus_text: '+155 Bonus'
  },

  // Valorant
  {
    id: 'prod-val-475',
    game_id: 'game-valorant',
    name: '475 Valorant Points',
    slug: '475-vp',
    description: 'Official Riot Games Points for weapon skins & night market.',
    product_type: 'VP',
    denomination: '475 VP',
    price: 155.00,
    discount_price: 148.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 1,
    delivery_type: 'instant_api'
  },
  {
    id: 'prod-val-1000',
    game_id: 'game-valorant',
    name: '1,000 Valorant Points',
    slug: '1000-vp',
    description: 'Official Riot Games Points.',
    product_type: 'VP',
    denomination: '1,000 VP',
    price: 310.00,
    discount_price: 295.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 2,
    delivery_type: 'instant_api'
  },
  {
    id: 'prod-val-2050',
    game_id: 'game-valorant',
    name: '2,050 Valorant Points',
    slug: '2050-vp',
    description: 'Official Riot Games Points.',
    product_type: 'VP',
    denomination: '2,050 VP',
    price: 620.00,
    discount_price: 590.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 3,
    delivery_type: 'instant_api'
  },

  // Genshin Impact
  {
    id: 'prod-gi-welkin',
    game_id: 'game-genshin',
    name: 'Blessing of the Welkin Moon',
    slug: 'welkin-moon',
    description: '300 Genesis Crystals immediately + 90 Primogems daily for 30 days.',
    product_type: 'Subscription',
    denomination: '30-Day Welkin',
    price: 279.00,
    discount_price: 249.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: true,
    sort_order: 1,
    delivery_type: 'instant_api',
    bonus_text: 'POPULAR'
  },
  {
    id: 'prod-gi-300',
    game_id: 'game-genshin',
    name: '300 + 30 Genesis Crystals',
    slug: '330-genesis-crystals',
    description: 'Direct UID recharge.',
    product_type: 'Crystals',
    denomination: '330 Crystals',
    price: 279.00,
    discount_price: 255.00,
    currency: 'PHP',
    image_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=300&q=80',
    active: true,
    featured: false,
    sort_order: 2,
    delivery_type: 'instant_api'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1001',
    order_number: 'VPH-2026-98124',
    email: 'karl.gamer@gmail.com',
    phone: '09171234567',
    game_id: 'game-mlbb',
    game_name: 'Mobile Legends: Bang Bang',
    product_id: 'prod-ml-wp',
    product_name: 'Weekly Diamond Pass',
    quantity: 1,
    unit_price: 99.00,
    discount: 0,
    payment_fee: 2.00,
    total: 101.00,
    currency: 'PHP',
    payment_method: 'GCash',
    payment_reference: 'GCASH-REF-8947112',
    payment_status: 'PAID',
    fulfillment_status: 'COMPLETED',
    order_status: 'COMPLETED',
    customer_data: {
      'User ID': '34918234',
      'Zone ID': '3201'
    },
    created_at: '2026-09-23T22:15:00Z',
    updated_at: '2026-09-23T22:15:45Z',
    events: [
      {
        id: 'ev-1',
        order_id: 'order-1001',
        status: 'Order Placed',
        message: 'Order created and payment initiated via GCash.',
        created_at: '2026-09-23T22:15:00Z'
      },
      {
        id: 'ev-2',
        order_id: 'order-1001',
        status: 'Payment Confirmed',
        message: 'GCash payment confirmed (PHP 101.00).',
        created_at: '2026-09-23T22:15:20Z'
      },
      {
        id: 'ev-3',
        order_id: 'order-1001',
        status: 'Fulfillment Completed',
        message: 'Diamonds credited to Moonton Account (34918234 [3201]).',
        created_at: '2026-09-23T22:15:45Z'
      }
    ]
  }
];
