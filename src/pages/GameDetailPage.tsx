import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_GAMES, MOCK_PRODUCTS, MOCK_PRODUCT_FIELDS } from '../data/mockData';
import { gamesService } from '../services/gamesService';
import type { Game, Product, ProductField, PaymentMethodId } from '../types';
import { ordersService } from '../services/ordersService';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Gamepad2
} from 'lucide-react';

export const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(() => {
    return MOCK_GAMES.find((g) => g.slug === slug) || null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [dynamicFields, setDynamicFields] = useState<ProductField[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('gcash');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load game, products, and dynamic fields
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        
        // 1. Get Game
        const foundGame = await gamesService.getGameBySlug(slug);
        const resolvedGame = foundGame || MOCK_GAMES.find((g) => g.slug === slug) || MOCK_GAMES[0];
        setGame(resolvedGame);

        // 2. Get Products & Fields
        if (resolvedGame) {
          const [fetchedProducts, fetchedFields] = await Promise.all([
            gamesService.getGameProducts(resolvedGame.id),
            gamesService.getGameProductFields(resolvedGame.id),
          ]);

          const validProducts = fetchedProducts.length > 0 
            ? fetchedProducts 
            : MOCK_PRODUCTS.filter((p) => p.game_id === resolvedGame.id);

          setProducts(validProducts);
          setSelectedProduct(validProducts[0] || null);

          const validFields = fetchedFields.length > 0
            ? fetchedFields
            : (MOCK_PRODUCT_FIELDS[resolvedGame.id] || []);

          setDynamicFields(validFields);
        }
      } catch (err) {
        console.warn('Error loading dynamic game details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [slug]);

  // Field change handler
  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrorMsg(null);
  };

  // Payment Options
  const paymentMethods = [
    { id: 'gcash' as PaymentMethodId, name: 'GCash', fee: 0, tag: 'Instant & Zero Fee' },
    { id: 'maya' as PaymentMethodId, name: 'Maya', fee: 0, tag: 'Instant' },
    { id: 'qrph' as PaymentMethodId, name: 'QR Ph (All PH Banks)', fee: 2.00, tag: 'BDO / BPI / UnionBank' },
    { id: 'card' as PaymentMethodId, name: 'Visa / Mastercard', fee: 5.00, tag: 'Debit / Credit' },
  ];

  const selectedPaymentInfo = paymentMethods.find((p) => p.id === paymentMethod);
  const itemPrice = selectedProduct?.discount_price ?? selectedProduct?.price ?? 0;
  const paymentFee = selectedPaymentInfo?.fee ?? 0;
  const totalPrice = itemPrice + paymentFee;

  const { user } = useAuth();

  // Handle Checkout Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!game) {
      setErrorMsg('Game details could not be loaded.');
      return;
    }

    if (!selectedProduct) {
      setErrorMsg('Please select a package first.');
      return;
    }

    // Validate dynamic required fields
    for (const field of dynamicFields) {
      if (field.required && !fieldValues[field.field_name]?.trim()) {
        setErrorMsg(`Please provide your ${field.field_label}.`);
        return;
      }
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your official receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const generatedOrderNumber = `VPH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await ordersService.createOrder({
        order_number: generatedOrderNumber,
        user_id: user?.id ?? null,
        email: email.trim(),
        phone: phone.trim() || null,
        game_id: game.id,
        game_name: game.name,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: 1,
        unit_price: itemPrice,
        discount: selectedProduct.discount_price ? selectedProduct.price - selectedProduct.discount_price : 0,
        payment_fee: paymentFee,
        total: totalPrice,
        currency: 'PHP',
        payment_method: selectedPaymentInfo?.name || 'GCash',
        customer_data: fieldValues,
      });

      navigate(`/track-order?orderId=${generatedOrderNumber}&new=true`);
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      // Still navigate so customer sees order tracking
      navigate(`/track-order?orderId=${generatedOrderNumber}&new=true`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !game) {
    return (
      <div className="py-24 flex items-center justify-center text-[#00CFFF]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <Gamepad2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Game Not Found</h2>
        <p className="text-sm text-[#94A3B8] mb-6">The requested game title does not exist or has been disabled.</p>
        <Link to="/games" className="px-5 py-2.5 bg-[#1677FF] text-white text-sm font-semibold rounded-xl">
          Browse All Games
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-6">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/games" className="hover:text-white transition-colors">Games</Link>
        <span>/</span>
        <span className="text-[#00CFFF] font-semibold">{game.name}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Game Details, Dynamic Account Fields & Package Selector */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Game Banner Header */}
          <div className="relative rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              <img
                src={game.logo_url || game.banner_url}
                alt={game.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#0B1D36] shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00CFFF]">
                    {game.publisher ?? 'Official Top-Up'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                    Direct API
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
                  {game.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
                  {game.description}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Step 1: In-Game Account Identification */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1677FF] text-white text-xs font-black font-heading">
                  1
                </span>
                <h2 className="text-base font-bold text-white">Enter Account Information</h2>
              </div>
              <p className="text-xs text-[#94A3B8] mb-5">
                Verify your details carefully. Orders are automatically delivered to this ID.
              </p>

              {dynamicFields.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {dynamicFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                        <span>{field.field_label} {field.required && <span className="text-red-400">*</span>}</span>
                      </label>
                      <input
                        type={field.field_type === 'number' ? 'number' : 'text'}
                        placeholder={field.placeholder || `Enter your ${field.field_label}`}
                        value={fieldValues[field.field_name] || ''}
                        onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                        required={field.required}
                        className="w-full h-11 px-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      User ID / Player ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12345678"
                      value={fieldValues['user_id'] || ''}
                      onChange={(e) => handleFieldChange('user_id', e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Top-Up Package */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1677FF] text-white text-xs font-black font-heading">
                    2
                  </span>
                  <h2 className="text-base font-bold text-white">Select Denomination</h2>
                </div>
                <span className="text-xs text-[#00CFFF] font-semibold">{products.length} Packages Available</span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No packages currently available for this game. Check back shortly.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {products.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setErrorMsg(null);
                        }}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1677FF]/15 border-[#00CFFF] shadow-[0_0_20px_rgba(0,207,255,0.25)] ring-1 ring-[#00CFFF]'
                            : 'bg-[#050B18] border-[#0B1D36] hover:border-[#1677FF]/50 hover:bg-[#0B1D36]/40'
                        }`}
                      >
                        {p.featured && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-black uppercase tracking-wider text-white">
                            Popular
                          </span>
                        )}

                        <div>
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          {p.bonus_text && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-[#22C55E]">
                              +{p.bonus_text}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 pt-2 border-t border-[#0B1D36]/60 flex items-baseline justify-between">
                          <span className="text-sm font-black text-[#00CFFF]">
                            ₱{(p.discount_price ?? p.price).toFixed(2)}
                          </span>
                          {p.discount_price && (
                            <span className="text-[11px] text-gray-500 line-through">
                              ₱{p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1677FF] text-white text-xs font-black font-heading">
                  3
                </span>
                <h2 className="text-base font-bold text-white">Select Payment Channel</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1677FF]/15 border-[#00CFFF] ring-1 ring-[#00CFFF]'
                          : 'bg-[#050B18] border-[#0B1D36] hover:border-[#1677FF]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#00CFFF]' : 'border-gray-600'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#00CFFF]" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{pm.name}</div>
                          <div className="text-[10px] text-[#94A3B8]">{pm.tag}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-300">
                          {pm.fee === 0 ? <span className="text-[#22C55E]">No fee</span> : `+₱${pm.fee.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact & Receipt */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1677FF] text-white text-xs font-black font-heading">
                  4
                </span>
                <h2 className="text-base font-bold text-white">Receipt & Delivery Notification</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    className="w-full h-11 px-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
                  />
                  <span className="text-[10px] text-[#94A3B8]">We will send transaction receipts and delivery proofs here.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="0917 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Optional SMS update on completion.</span>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Mobile Submit Button */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Securing Order...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Proceed to Payment (₱{totalPrice.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-[#0B1D36]">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Selected Game:</span>
                <span className="font-semibold text-white">{game.name}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Item / Package:</span>
                <span className="font-semibold text-[#00CFFF]">
                  {selectedProduct ? selectedProduct.name : 'None Selected'}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Payment Channel:</span>
                <span className="font-semibold text-white">{selectedPaymentInfo?.name || 'GCash'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#0B1D36] space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Item Price:</span>
                <span>₱{itemPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Channel Processing Fee:</span>
                <span>₱{paymentFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#0B1D36] flex justify-between text-base font-black text-white">
                <span>Total Amount:</span>
                <span className="text-[#00CFFF] font-heading text-lg">₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Desktop Pay CTA */}
            <div className="hidden lg:block pt-2">
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Securing Order...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust badge list */}
            <div className="pt-2 border-t border-[#0B1D36] space-y-2 text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Instant automated API fulfillment</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00CFFF]" />
                <span>Zero password access required</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
