import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, Pencil, X, Check, IndianRupee, Calendar, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Food', 'Rent', 'Transport',
  'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      fetchTransactions();
      resetForm();
    } catch (err) {
      console.error('Error saving transaction', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        console.error('Error deleting transaction', err);
      }
    }
  };

  const startEdit = (tx) => {
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      description: tx.description || ''
    });
    setEditingId(tx.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(102,126,234,0.2)', borderTopColor: '#667eea',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-fadeInUp">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Transactions</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'} total
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card mb-8 animate-fadeInUp" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <button onClick={resetForm} className="btn-danger">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Type Toggle */}
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: formData.type === 'income' ? 'rgba(56,239,125,0.12)' : 'rgba(255,255,255,0.04)',
                  color: formData.type === 'income' ? '#38ef7d' : '#64748b',
                  border: `1px solid ${formData.type === 'income' ? 'rgba(56,239,125,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: formData.type === 'expense' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)',
                  color: formData.type === 'expense' ? '#f87171' : '#64748b',
                  border: `1px solid ${formData.type === 'expense' ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                Expense
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  <IndianRupee className="w-3 h-3 inline mr-1" />Amount
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g., 5000"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  <Tag className="w-3 h-3 inline mr-1" />Category
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  <Calendar className="w-3 h-3 inline mr-1" />Date
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  <FileText className="w-3 h-3 inline mr-1" />Description
                </label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary">
                <Check className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <IndianRupee className="w-10 h-10" />
                      <p style={{ fontSize: '0.9rem' }}>No transactions yet</p>
                      <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 4 }}>
                        Click "Add Entry" to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </td>
                    <td style={{ color: '#e2e8f0', fontWeight: 500 }}>
                      {tx.description || <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: 'rgba(102,126,234,0.1)',
                        color: '#a5b4fc'
                      }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <span style={{ color: tx.type === 'income' ? '#38ef7d' : '#f87171' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => startEdit(tx)} className="btn-danger" style={{ color: '#94a3b8' }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(tx.id)} className="btn-danger" style={{ marginLeft: 4 }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
