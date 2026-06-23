import { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ef4444'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/dashboard');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!summary) return <div className="p-8 text-center text-red-500">Failed to load data. Make sure backend is running.</div>;

  const chartData = Object.keys(summary.expense_by_category).map((key) => ({
    name: key,
    value: summary.expense_by_category[key],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Monthly Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Total Income</h2>
          <p className="text-3xl font-bold text-success mt-2">${summary.total_income.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Total Expenses</h2>
          <p className="text-3xl font-bold text-danger mt-2">${summary.total_expense.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Current Balance</h2>
          <p className={`text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
            ${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Expenses by Category</h2>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400">
            No expense data available for chart.
          </div>
        )}
      </div>
    </div>
  );
}
