import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
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
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      
      fetchTransactions();
      resetForm();
    } catch (error) {
      console.error('Error saving transaction', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction', error);
      }
    }
  };

  const startEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description || ''
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center">Loading transactions...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Groceries, Salary, Rent"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-success text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {editingId ? 'Update' : 'Save'} Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No transactions found. Start by adding one!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => startEdit(tx)}
                        className="text-gray-400 hover:text-primary transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-gray-400 hover:text-danger transition-colors p-1 ml-2"
                      >
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
