import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Game, ProductCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  X
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Mobile Games',
  'PC Games',
  'Console',
  'Gift Cards',
  'Subscriptions',
  'Game Points',
];

export const AdminGamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    const { games: data } = await adminService.getAllGames();
    setGames(data);
    setFilteredGames(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredGames(games);
    } else {
      const q = search.toLowerCase();
      setFilteredGames(
        games.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.slug.toLowerCase().includes(q) ||
            g.category.toLowerCase().includes(q)
        )
      );
    }
  }, [search, games]);

  const handleCreateNew = () => {
    setEditingGame({
      id: `game_${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      category: 'Mobile Games',
      logo_url: '',
      banner_url: '',
      active: true,
      featured: false,
      sort_order: games.length + 1,
      starting_price: 50,
      badges: ['INSTANT'],
    });
    setModalOpen(true);
  };

  const handleEdit = (game: Game) => {
    setEditingGame({ ...game });
    setModalOpen(true);
  };

  const handleDelete = async (gameId: string) => {
    if (confirm('Are you sure you want to remove this game? Top-up tiers linked to it may be affected.')) {
      await adminService.deleteGame(gameId);
      loadGames();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame || !editingGame.name || !editingGame.slug) return;
    setSaving(true);
    await adminService.saveGame(editingGame as Game);
    setSaving(false);
    setModalOpen(false);
    loadGames();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Game Catalog</h1>
          <p className="text-gray-400 text-sm mt-1">Configure live games, logos, banners, and store featured tags</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1677FF] hover:bg-[#1260d1] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1677FF]/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games by title, slug, or category..."
          className="w-full pl-11 pr-4 py-2.5 bg-[#08152A] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1677FF]"
        />
      </div>

      {/* Games Table */}
      <div className="bg-[#08152A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#050B18] text-xs uppercase font-semibold text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Game</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Min Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    {loading ? 'Loading catalog...' : 'No games found.'}
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={game.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'}
                          alt={game.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-[#050B18]"
                        />
                        <div>
                          <div className="font-bold text-white">{game.name}</div>
                          <div className="text-xs text-gray-400 line-clamp-1">{game.publisher || 'Digital Top-Up'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#00CFFF]">/{game.slug}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-300">{game.category}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₱{game.starting_price || 0}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                        game.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {game.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {game.featured ? (
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> Featured
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(game)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Game Modal */}
      {modalOpen && editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#08152A] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xl font-bold text-white">
                {editingGame.name ? `Edit ${editingGame.name}` : 'Add New Game'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Game Title *</label>
                  <input
                    type="text"
                    required
                    value={editingGame.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingGame({
                        ...editingGame,
                        name,
                        slug: editingGame.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      });
                    }}
                    placeholder="e.g. Mobile Legends"
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#1677FF]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingGame.slug || ''}
                    onChange={(e) => setEditingGame({ ...editingGame, slug: e.target.value })}
                    placeholder="e.g. mobile-legends"
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-[#00CFFF] focus:outline-none focus:border-[#1677FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Category</label>
                  <select
                    value={editingGame.category || 'Mobile Games'}
                    onChange={(e) => setEditingGame({ ...editingGame, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Starting Price (₱)</label>
                  <input
                    type="number"
                    value={editingGame.starting_price || 0}
                    onChange={(e) => setEditingGame({ ...editingGame, starting_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Logo URL</label>
                <input
                  type="text"
                  value={editingGame.logo_url || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Banner URL / Backdrop</label>
                <input
                  type="text"
                  value={editingGame.banner_url || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, banner_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingGame.description || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                  placeholder="Short top-up details..."
                  className="w-full p-3 bg-[#050B18] border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editingGame.active ?? true}
                    onChange={(e) => setEditingGame({ ...editingGame, active: e.target.checked })}
                    className="w-4 h-4 accent-[#1677FF] rounded"
                  />
                  <span>Active & Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editingGame.featured ?? false}
                    onChange={(e) => setEditingGame({ ...editingGame, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#1677FF] rounded"
                  />
                  <span>Featured on Home</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1677FF] hover:bg-[#1260d1] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1677FF]/25 transition"
                >
                  {saving ? 'Saving...' : 'Save Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
