import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Product, Game, DeliveryType } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Layers,
  Filter
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('ALL');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    game_id: '',
    name: '',
    slug: '',
    description: '',
    product_type: 'In-Game Currency',
    denomination: '',
    price: 0,
    discount_price: undefined,
    currency: 'PHP',
    image_url: '',
    active: true,
    featured: false,
    sort_order: 1,
    delivery_type: 'instant_api',
    bonus_text: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [productsRes, gamesRes] = await Promise.all([
      adminService.getAllProducts(),
      adminService.getAllGames()
    ]);
    setProducts(productsRes.products);
    setGames(gamesRes.games);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedGameFilter !== 'ALL') {
      result = result.filter(p => p.game_id === selectedGameFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.denomination.toLowerCase().includes(q) ||
        p.product_type.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedGameFilter]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        game_id: games[0]?.id || '',
        name: '',
        slug: '',
        description: '',
        product_type: 'In-Game Currency',
        denomination: '',
        price: 0,
        discount_price: undefined,
        currency: 'PHP',
        image_url: '',
        active: true,
        featured: false,
        sort_order: (products.length + 1),
        delivery_type: 'instant_api',
        bonus_text: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.game_id || !formData.denomination) {
      alert('Please fill in required fields (Name, Game, Denomination).');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      game_id: formData.game_id!,
      name: formData.name!,
      slug,
      description: formData.description || '',
      product_type: formData.product_type || 'Currency',
      denomination: formData.denomination!,
      price: Number(formData.price) || 0,
      discount_price: formData.discount_price ? Number(formData.discount_price) : undefined,
      currency: formData.currency || 'PHP',
      image_url: formData.image_url || '',
      active: formData.active ?? true,
      featured: formData.featured ?? false,
      sort_order: Number(formData.sort_order) || 1,
      delivery_type: (formData.delivery_type as DeliveryType) || 'instant_api',
      bonus_text: formData.bonus_text || undefined,
    };

    const res = await adminService.saveProduct(productToSave);
    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert(`Failed to save product: ${res.error?.message}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    const res = await adminService.deleteProduct(id);
    if (res.success) {
      loadData();
    } else {
      alert(`Failed to delete: ${res.error?.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">Products & Tiers</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage denominations, pricing, discounts, and delivery channels.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1677FF] to-[#00CFFF] text-white font-semibold rounded-xl hover:opacity-95 transition shadow-lg shadow-[#1677FF]/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, denomination, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#08152A] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00CFFF]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="bg-[#08152A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
          >
            <option value="ALL">All Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#08152A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Product / Tier</th>
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const game = games.find(g => g.id === p.game_id);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-bold text-xs text-[#00CFFF]">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{p.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{p.denomination}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-medium">
                        {game?.name || p.game_id}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {p.product_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          ₱{p.discount_price ?? p.price}
                        </div>
                        {p.discount_price && (
                          <div className="text-xs text-gray-400 line-through">
                            ₱{p.price}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {p.delivery_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          p.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {p.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#08152A] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Tier' : 'Add New Product Tier'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Target Game *
                </label>
                <select
                  value={formData.game_id}
                  onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                  required
                >
                  <option value="">Select a game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 50 + 5 Diamonds"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Denomination *
                  </label>
                  <input
                    type="text"
                    value={formData.denomination || ''}
                    onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                    placeholder="e.g. 55 Diamonds"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Price (PHP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Discount Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price ?? ''}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="e.g. 45"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Product Type
                  </label>
                  <input
                    type="text"
                    value={formData.product_type || ''}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    placeholder="Diamonds, Tokens, Points, Gift Card"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Delivery Channel
                  </label>
                  <select
                    value={formData.delivery_type}
                    onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value as DeliveryType })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                  >
                    <option value="instant_api">Instant API (Direct UID)</option>
                    <option value="digital_code">Digital Code / Voucher</option>
                    <option value="manual">Manual Processing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bonus / Deal Badge (Optional)
                </label>
                <input
                  type="text"
                  value={formData.bonus_text || ''}
                  onChange={(e) => setFormData({ ...formData, bonus_text: e.target.value })}
                  placeholder="e.g. +5 BONUS or HOT DEAL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00CFFF]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-[#1677FF] focus:ring-[#1677FF]"
                  />
                  <span>Active for purchase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-[#1677FF] focus:ring-[#1677FF]"
                  />
                  <span>Featured tier</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#1677FF] to-[#00CFFF] text-white font-semibold rounded-xl hover:opacity-95 transition shadow-lg shadow-[#1677FF]/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
