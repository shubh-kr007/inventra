import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Search and filter
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not retrieve catalog products.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const openAddModal = () => {
    setEditProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setModalError(null);
    setIsOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setModalError(null);
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Frontend validations
    if (!name.trim()) return setModalError('Product Name is required.');
    if (!sku.trim()) return setModalError('SKU/Code is required.');
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) return setModalError('Price must be a positive number.');
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) return setModalError('Quantity cannot be negative.');

    setSubmitting(true);
    try {
      const url = editProduct 
        ? `${API_URL}/api/products/${editProduct.id}` 
        : `${API_URL}/api/products`;
      const method = editProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          sku,
          price: parsedPrice,
          quantity: parsedQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save product details.');
      }

      setIsOpen(false);
      fetchProducts();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not delete product.');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#00D9FF]" />
            Products Catalog
          </h1>
          <p className="text-sm text-inventra-muted mt-1">
            Maintain SKU definitions, stock quantities, and pricing attributes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-glow transition duration-300 uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-200 rounded-2xl text-sm shadow-glow-red">
          {error}
        </div>
      )}

      {/* Filters bar */}
      <div className="flex items-center gap-3 glass-panel px-4 py-1.5 rounded-2xl border border-white/6 max-w-md">
        <Search className="w-4 h-4 text-inventra-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SKU, product name..."
          className="w-full bg-transparent border-none text-sm text-white focus:outline-none py-2"
        />
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-inventra-muted">Retrieving catalog records...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/6 overflow-hidden shadow-glow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">SKU / Code</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Price (Unit)</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  // Determine stock status styling
                  let statusText = 'In Stock';
                  let statusClass = 'bg-emerald-500/10 border-emerald-500/20 text-[#22C55E]';
                  if (p.quantity === 0) {
                    statusText = 'Out of Stock';
                    statusClass = 'bg-red-500/10 border-red-500/20 text-[#EF4444]';
                  } else if (p.quantity <= 10) {
                    statusText = 'Low Stock';
                    statusClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-white/2 transition duration-150">
                      <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                      <td className="px-6 py-4 text-sm font-mono text-indigo-300">{p.sku}</td>
                      <td className="px-6 py-4 text-sm font-semibold">${parseFloat(p.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold">{p.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusClass} uppercase tracking-wider`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-white/3 hover:bg-[#00D9FF]/10 text-inventra-muted hover:text-[#00D9FF] border border-white/5 hover:border-[#00D9FF]/20 rounded-lg transition duration-200"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 bg-white/3 hover:bg-red-500/10 text-inventra-muted hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition duration-200"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 text-center rounded-2xl border border-white/6 space-y-4 shadow-glow">
          <HelpCircle className="w-12 h-12 text-inventra-muted mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-sm text-inventra-muted max-w-sm mx-auto">
              There are no products in the catalog matching your filter parameters.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-[#00D9FF]/10 border border-white/10 hover:border-[#00D9FF]/20 rounded-xl transition duration-300"
          >
            Create First Product
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-panel p-8 rounded-3xl relative shadow-glow border border-white/10"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 text-inventra-muted hover:text-white rounded-lg transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editProduct ? 'Modify Product Details' : 'Register New Product'}
                  </h2>
                  <p className="text-xs text-inventra-muted mt-0.5">
                    {editProduct ? 'Update product pricing, counts, and descriptions.' : 'Introduce a new SKU reference item into the storage vault.'}
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="mb-6 flex items-start gap-3 p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-xl text-xs shadow-glow-red">
                  <AlertCircle className="w-4 h-4 text-inventra-red shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Quantum Processor X1"
                    className="w-full neo-input py-2.5 px-4 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider">SKU / Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. QNT-PROC-X1"
                    className="w-full neo-input py-2.5 px-4 text-sm font-mono"
                    required
                    disabled={!!editProduct} // SKU shouldn't be edited once created typically, but backend allows if unique. Standard rule is lock SKU.
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full neo-input py-2.5 px-4 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Initial Stock</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full neo-input py-2.5 px-4 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-150 uppercase tracking-wide"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-glow transition duration-300 uppercase tracking-wide"
                  >
                    {submitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
