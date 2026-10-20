import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_GAMES, MOCK_PRODUCTS, MOCK_PRODUCT_FIELDS } from '../data/mockData';
import type { Product, PaymentMethodId } from '../types';
import { ordersService } from '../services/ordersService';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find game by slug
  const game = useMemo(() => {
    return MOCK_GAMES.find((g) => g.slug === slug) || MOCK_GAMES[0];
  }, [slug]);

  // Find products for this game
  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.game_id === game.id);
  }, [game.id]);

  // Find dynamic fields for this game
  const dynamicFields = useMemo(() => {
    return MOCK_PRODUCT_FIELDS[game.id] || [];
  }, [game.id]);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('gcash');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                src={game.logo_url}
                alt={game.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#0B1D36] shadow-xl"
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
            
            {/* Step 1: Dynamic Account Fields (Per Spec Section 8) */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#0B1D36] pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1677FF] text-white text-xs font-bold">
                  1
                </span>
                <h2 className="text-lg font-bold text-white font-heading">
                  Enter In-Game Account Details
                </h2>
              </div>

              {dynamicFields.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {dynamicFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-200">
                        {field.field_label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      
                      {field.field_type === 'select' ? (
                        <select
                          value={fieldValues[field.field_name] || ''}
                          onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                          className="w-full h-11 px-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="">{field.placeholder}</option>
                          {field.validation_rules?.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.field_type}
                          placeholder={field.placeholder}
                          value={fieldValues[field.field_name] || ''}
                          onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                          className="w-full h-11 px-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00CFFF]"
                        />
                      )}

                      {field.validation_rules?.helperText && (
                        <p className="text-[11px] text-[#94A3B8]">
                          {field.validation_rules.helperText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#94A3B8]">
                  Digital voucher code will be issued directly upon payment confirmation.
                </div>
              )}
            </div>

            {/* Step 2: Select Top-Up Package */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#0B1D36] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1677FF] text-white text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-white font-heading">
                    Select Recharge Package
                  </h2>
                </div>
                <span className="text-xs text-[#00CFFF] font-semibold">
                  {products.length} options available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  const price = product.discount_price ?? product.price;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product);
                        setErrorMsg(null);
                      }}
                      className={`relative p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1677FF]/15 border-[#00CFFF] shadow-[0_0_15px_rgba(0,207,255,0.25)]'
                          : 'bg-[#050B18] border-[#0B1D36] hover:border-[#00CFFF]/40 hover:bg-[#0B1D36]/40'
                      }`}
                    >
                      {product.bonus_text && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-red-500 text-white shadow-sm">
                          {product.bonus_text}
                        </span>
                      )}

                      <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                        {product.name}
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-base font-black text-[#00CFFF] font-heading">
                          ₱{price.toFixed(2)}
                        </span>
                        {product.discount_price && (
                          <span className="text-[10px] text-[#94A3B8] line-through">
                            ₱{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#00CFFF] absolute bottom-3 right-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#0B1D36] pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1677FF] text-white text-xs font-bold">
                  3
                </span>
                <h2 className="text-lg font-bold text-white font-heading">
                  Choose Payment Channel
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3.5 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1677FF]/15 border-[#00CFFF]'
                          : 'bg-[#050B18] border-[#0B1D36] hover:border-gray-600'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-white">
                          {method.name}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          {method.tag}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#00CFFF]">
                          {method.fee === 0 ? 'FREE' : `+₱${method.fee.toFixed(2)}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact / Receipt Information */}
            <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#0B1D36] pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1677FF] text-white text-xs font-bold">
                  4
                </span>
                <h2 className="text-lg font-bold text-white font-heading">
                  Order Receipt & Contact
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Where should we email your receipt?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="0917xxxxxxx (For SMS updates)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message display */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mobile Submit Button (Sticky on mobile) */}
            <div className="block lg:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-base font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_25px_rgba(0,207,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing Order...' : `Pay Now • ₱${totalPrice.toFixed(2)}`}
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Order Summary Card (Desktop sticky per Spec Section 21) */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="rounded-2xl bg-[#08152A] border border-[#0B1D36] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white font-heading border-b border-[#0B1D36] pb-3">
              Order Summary
            </h3>

            {/* Item Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Game</span>
                <span className="text-white font-semibold">{game.name}</span>
              </div>

              <div className="flex justify-between text-[#94A3B8]">
                <span>Selected Package</span>
                <span className="text-white font-semibold">{selectedProduct?.name ?? 'None'}</span>
              </div>

              {Object.entries(fieldValues).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[#94A3B8]">
                  <span className="capitalize">{k.replace('_', ' ')}</span>
                  <span className="text-white font-mono">{v || '—'}</span>
                </div>
              ))}

              <div className="flex justify-between text-[#94A3B8]">
                <span>Payment Method</span>
                <span className="text-[#00CFFF] font-semibold">{selectedPaymentInfo?.name}</span>
              </div>
            </div>

            <div className="border-t border-[#0B1D36] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Subtotal</span>
                <span>₱{itemPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Gateway Fee</span>
                <span>{paymentFee === 0 ? '₱0.00' : `₱${paymentFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#0B1D36]">
                <span>Total Amount</span>
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
