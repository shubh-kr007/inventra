import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  HelpCircle,
  Eye,
  FileText,
  User,
  Trash
} from 'lucide-react';

export default function Orders() {
  const { token } = useAuth();
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New order fields
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not retrieve orders database.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [resCust, resProd] = await Promise.all([
        fetch(`${API_URL}/api/customers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!resCust.ok || !resProd.ok) throw new Error('Failed to synchronize lookup options.');
      
      const custData = await resCust.json();
      const prodData = await resProd.json();
      
      setCustomers(custData);
      setProducts(prodData);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchDependencies()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [token]);

  const openCreateModal = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setModalError(null);
    setIsCreateOpen(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calculate live order total for UI feedback
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (!item.product_id) return sum;
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (!product) return sum;
      return sum + (product.price * parseInt(item.quantity || 0));
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Front-end Validations
    if (!customerId) return setModalError('Please select a customer for this order.');
    
    // Check if items are valid
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id) {
        return setModalError(`Please select a product for line item ${i + 1}.`);
      }
      
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return setModalError(`Quantity must be greater than 0 on line item ${i + 1}.`);
      }

      // Check stock limits on frontend
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product && product.quantity < qty) {
        return setModalError(`Insufficient stock for product '${product.name}'. Available: ${product.quantity}, Requested: ${qty}.`);
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          items: items.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity)
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to place order.');
      }

      setIsCreateOpen(false);
      refreshAll();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this order? Quantities will be returned back to inventory.')) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not cancel order.');
      refreshAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-[#00D9FF]" />
            Order Management
          </h1>
          <p className="text-sm text-inventra-muted mt-1">
            Dispatch inventory, print order invoices, and track buyer logs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-glow transition duration-300 uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-200 rounded-2xl text-sm shadow-glow-red">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-inventra-muted">Retrieving transactions database...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/6 overflow-hidden shadow-glow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Customer Reference</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Processed Date</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/2 transition duration-150">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[#00D9FF]">#INV-{o.id.toString().padStart(5, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-white">{o.customer?.full_name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-400">${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-inventra-muted">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openDetailsModal(o)}
                          className="p-1.5 bg-white/3 hover:bg-[#00D9FF]/10 text-inventra-muted hover:text-[#00D9FF] border border-white/5 hover:border-[#00D9FF]/20 rounded-lg transition duration-200"
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="p-1.5 bg-white/3 hover:bg-red-500/10 text-inventra-muted hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition duration-200"
                          title="Cancel/Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 text-center rounded-2xl border border-white/6 space-y-4 shadow-glow">
          <HelpCircle className="w-12 h-12 text-inventra-muted mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No orders processed</h3>
            <p className="text-sm text-inventra-muted max-w-sm mx-auto">
              There are no sales transactions logged in the database files.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-[#00D9FF]/10 border border-white/10 hover:border-[#00D9FF]/20 rounded-xl transition duration-300"
          >
            Draft First Order
          </button>
        </div>
      )}

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl glass-panel p-8 rounded-3xl relative shadow-glow border border-white/10 text-white"
            >
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 text-inventra-muted hover:text-white rounded-lg transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-start border-b border-white/8 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00D9FF]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Transaction Invoice</h2>
                    <p className="text-xs text-indigo-300 font-mono mt-0.5">
                      Order ID: #INV-{selectedOrder.id.toString().padStart(5, '0')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] rounded-full uppercase tracking-wider">
                    Paid & Closed
                  </span>
                  <p className="text-[10px] text-inventra-muted mt-2">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl mb-6 flex items-start gap-3">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#00D9FF]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Billed To</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedOrder.customer?.full_name}</p>
                  <p className="text-xs text-indigo-300 truncate mt-0.5">{selectedOrder.customer?.email}</p>
                  {selectedOrder.customer?.phone && (
                    <p className="text-xs text-inventra-muted mt-0.5">{selectedOrder.customer?.phone}</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-inventra-muted uppercase tracking-wider mb-2">Order Items breakdown</p>
                <div className="border border-white/8 rounded-2xl overflow-hidden bg-white/1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/6 text-xs font-bold text-inventra-muted uppercase tracking-wider bg-white/2">
                        <th className="px-4 py-3">Product SKU</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4 text-sm">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-mono text-xs text-indigo-300">{item.product_sku}</td>
                          <td className="px-4 py-3 font-semibold text-white">{item.product_name}</td>
                          <td className="px-4 py-3 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount Footer */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/8">
                <span className="text-sm font-bold text-inventra-muted uppercase tracking-wider">Total Invoice Price</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl glass-panel p-8 rounded-3xl relative shadow-glow border border-white/10 max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 text-inventra-muted hover:text-white rounded-lg transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-10 h-10 bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Compile Sales Order</h2>
                  <p className="text-xs text-inventra-muted mt-0.5">
                    Select customer buyer and list the catalog items to deduct.
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="mb-6 flex items-start gap-3 p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-xl text-xs shadow-glow-red shrink-0 font-sans">
                  <AlertCircle className="w-4 h-4 text-inventra-red shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                  {/* Select Customer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Customer Buyer</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full neo-input py-2.5 px-4 text-sm bg-[#050816]"
                      required
                    >
                      <option value="">-- Choose Customer profile --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider flex justify-between items-center">
                      <span>Add Cart Items</span>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-[10px] text-[#00D9FF] hover:underline uppercase font-bold"
                      >
                        + Add product row
                      </button>
                    </label>

                    {items.map((item, index) => {
                      const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                      return (
                        <div key={index} className="flex items-center gap-3 bg-white/2 p-3 border border-white/5 rounded-2xl relative">
                          {/* Product Dropdown */}
                          <div className="flex-1 min-w-0">
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                              className="w-full neo-input py-2 px-3 text-xs bg-[#050816]"
                              required
                            >
                              <option value="">-- Select Product --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                  {p.name} - ${parseFloat(p.price).toFixed(2)} ({p.quantity} in stock) {p.quantity === 0 ? '[OUT OF STOCK]' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Product Quantity */}
                          <div className="w-24">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full neo-input py-2 px-3 text-xs"
                              placeholder="Qty"
                              required
                            />
                          </div>

                          {/* Line Subtotal */}
                          <div className="w-20 text-right text-xs font-bold text-indigo-300">
                            {selectedProduct 
                              ? `$${(selectedProduct.price * (parseInt(item.quantity) || 0)).toFixed(2)}`
                              : '$0.00'
                            }
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                            className="p-1 hover:bg-red-500/10 text-inventra-muted hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-lg transition duration-150 disabled:opacity-30"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtotals & Submit footer */}
                <div className="pt-6 border-t border-white/8 mt-6 shrink-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-inventra-muted uppercase tracking-wider">Dynamic Total</span>
                    <span className="text-xl font-black text-emerald-400">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="flex-1 py-3 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-150 uppercase tracking-wide"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-glow transition duration-300 uppercase tracking-wide"
                    >
                      {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
