import { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CHART_COLORS = ['#667eea', '#38ef7d', '#f59e0b', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#e879f9'];

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(102,126,234,0.2)',
            borderTopColor: '#667eea',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <p style={{ color: '#f87171' }}>Failed to load. Make sure backend is running on port 8000.</p>
      </div>
    );
  }

  const chartData = Object.keys(summary.expense_by_category).map((key) => ({
    name: key,
    value: summary.expense_by_category[key],
  }));

  const stats = [
    {
      label: 'Total Income',
      value: summary.total_income,
      type: 'income',
      icon: <ArrowUpRight className="w-5 h-5" />,
      color: '#38ef7d',
      gradient: 'linear-gradient(135deg, rgba(56,239,125,0.12), rgba(17,153,142,0.06))',
    },
    {
      label: 'Total Expenses',
      value: summary.total_expense,
      type: 'expense',
      icon: <ArrowDownRight className="w-5 h-5" />,
      color: '#f87171',
      gradient: 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(235,51,73,0.06))',
    },
    {
      label: 'Current Balance',
      value: summary.balance,
      type: 'balance',
      icon: <IndianRupee className="w-5 h-5" />,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, rgba(79,172,254,0.12), rgba(0,242,254,0.06))',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.75rem 1rem', minWidth: 120 }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{payload[0].name}</p>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 700 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fadeInUp">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card ${stat.type} glass-card animate-fadeInUp`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </span>
              <div style={{
                background: stat.gradient,
                borderRadius: '8px',
                padding: '6px',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: stat.color }}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-card animate-fadeInUp" style={{ animationDelay: '240ms', padding: '1.5rem' }}>
        <h2 className="text-lg font-semibold text-white mb-6">Expenses by Category</h2>
        {chartData.length > 0 ? (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: 4 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            <IndianRupee className="w-12 h-12" style={{ margin: '0 auto 1rem', opacity: 0.15, color: '#64748b' }} />
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>No expense data yet.</p>
            <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: '0.25rem' }}>Add some transactions to see the breakdown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
