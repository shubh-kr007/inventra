import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  HelpCircle,
  Mail,
  Phone,
  User
} from 'lucide-react';

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Search filter
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not retrieve customers registry.');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const openAddModal = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setModalError(null);
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Front-end Validations
    if (!fullName.trim()) return setModalError('Full Name is required.');
    if (!email.trim()) return setModalError('Email Address is required.');
    
    // Quick regex email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setModalError('Please supply a valid email address.');

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone: phone.trim() ? phone.trim() : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to register customer profile.');
      }

      setIsOpen(false);
      fetchCustomers();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer? This will also remove all associated order histories!')) return;
    try {
      const res = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not delete customer.');
      fetchCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter customers by search query
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#00D9FF]" />
            Customers Directory
          </h1>
          <p className="text-sm text-inventra-muted mt-1">
            Manage buyer profiles, contact coordinates, and check purchase links.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-glow transition duration-300 uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Customer
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
          placeholder="Search by full name, email..."
          className="w-full bg-transparent border-none text-sm text-white focus:outline-none py-2"
        />
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-inventra-muted">Retrieving customer directory files...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/6 overflow-hidden shadow-glow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Phone number</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-inventra-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/2 transition duration-150">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-[#00D9FF] font-black">{c.full_name.charAt(0)}</span>
                      </div>
                      {c.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-300">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-white">{c.phone || <span className="text-inventra-muted italic">—</span>}</td>
                    <td className="px-6 py-4 text-sm text-inventra-muted">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 bg-white/3 hover:bg-red-500/10 text-inventra-muted hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition duration-200"
                        title="Delete customer profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <h3 className="text-lg font-bold text-white">No customers registered</h3>
            <p className="text-sm text-inventra-muted max-w-sm mx-auto">
              There are no buyer profiles registered in the directory matching your filter parameters.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-[#00D9FF]/10 border border-white/10 hover:border-[#00D9FF]/20 rounded-xl transition duration-300"
          >
            Register First Customer
          </button>
        </div>
      )}

      {/* Add Modal */}
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
                  <Users className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Register New Customer</h2>
                  <p className="text-xs text-inventra-muted mt-0.5">
                    Save customer credentials and coordinates for invoice billing.
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
                  <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#00D9FF]" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full neo-input py-2.5 px-4 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. satoshi@bitcoin.org"
                    className="w-full neo-input py-2.5 px-4 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-inventra-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#22C55E]" /> Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 0199"
                    className="w-full neo-input py-2.5 px-4 text-sm"
                  />
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
                    {submitting ? 'Registering...' : 'Register Customer'}
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
