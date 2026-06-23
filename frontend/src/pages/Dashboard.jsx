import { useEffect, useState } from 'react';
import api from '../api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, IndianRupee, TrendingUp,
  Wallet, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#667eea', '#38ef7d', '#f59e0b', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#e879f9'];

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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);

  const formatShort = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(102,126,234,0.2)', borderTopColor: '#667eea',
            animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
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

  const pieData = Object.keys(summary.expense_by_category).map((key) => ({
    name: key, value: summary.expense_by_category[key],
  }));

  const stats = [
    {
      label: 'Total Income', value: summary.total_income, type: 'income',
      icon: <ArrowUpRight className="w-5 h-5" />, color: '#38ef7d',
      gradient: 'linear-gradient(135deg, rgba(56,239,125,0.12), rgba(17,153,142,0.06))',
    },
    {
      label: 'Total Expenses', value: summary.total_expense, type: 'expense',
      icon: <ArrowDownRight className="w-5 h-5" />, color: '#f87171',
      gradient: 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(235,51,73,0.06))',
    },
    {
      label: 'Current Balance', value: summary.balance, type: 'balance',
      icon: <IndianRupee className="w-5 h-5" />, color: '#4facfe',
      gradient: 'linear-gradient(135deg, rgba(79,172,254,0.12), rgba(0,242,254,0.06))',
    },
  ];

  // Savings rate ring
  const savingsRate = summary.savings_rate;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (circumference * Math.min(savingsRate, 100)) / 100;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.75rem 1rem', minWidth: 120 }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{payload[0].name || payload[0].payload?.month}</p>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 700 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 6 }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, fontSize: '0.85rem', fontWeight: 600 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
          <div key={stat.label} className={`stat-card ${stat.type} glass-card animate-fadeInUp`}
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </span>
              <div style={{ background: stat.gradient, borderRadius: '8px', padding: '6px', color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: stat.color }}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row — Bar Chart + Savings Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Bar Chart — Income vs Expenses */}
        <div className="lg:col-span-2 glass-card animate-fadeInUp" style={{ padding: '1.5rem', animationDelay: '240ms' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Income vs Expenses</h2>
          {summary.monthly_data.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthly_data} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatShort} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="income" name="Income" fill="#38ef7d" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expenses" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#475569' }}>No monthly data yet</p>
            </div>
          )}
        </div>

        {/* Savings Rate Ring */}
        <div className="glass-card animate-fadeInUp flex flex-col items-center justify-center" style={{ padding: '1.5rem', animationDelay: '320ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4 self-start">Savings Rate</h2>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              {/* Progress ring */}
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={savingsRate >= 50 ? '#38ef7d' : savingsRate >= 20 ? '#f59e0b' : '#f87171'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="text-2xl font-bold"
                style={{ color: savingsRate >= 50 ? '#38ef7d' : savingsRate >= 20 ? '#f59e0b' : '#f87171' }}>
                {savingsRate}%
              </span>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
            {savingsRate >= 50 ? 'Excellent! Keep it up 🎉' : savingsRate >= 20 ? 'Good, aim for 50%+ 💪' : 'Try to cut expenses ⚠️'}
          </p>
        </div>
      </div>

      {/* Bottom Row — Pie Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie Chart */}
        <div className="glass-card animate-fadeInUp" style={{ padding: '1.5rem', animationDelay: '400ms' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Expenses by Category</h2>
          {pieData.length > 0 ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 4 }}>{value}</span>
                    )} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <IndianRupee className="w-10 h-10" style={{ margin: '0 auto 1rem', opacity: 0.15, color: '#64748b' }} />
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>No expense data yet</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card animate-fadeInUp" style={{ padding: '1.5rem', animationDelay: '480ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#667eea' }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {summary.recent_transactions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {summary.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 36, height: 36, borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: tx.type === 'income'
                        ? 'rgba(56,239,125,0.1)' : 'rgba(248,113,113,0.1)',
                    }}>
                      {tx.type === 'income'
                        ? <ArrowUpRight className="w-4 h-4" style={{ color: '#38ef7d' }} />
                        : <ArrowDownRight className="w-4 h-4" style={{ color: '#f87171' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || tx.category}</p>
                      <p style={{ color: '#475569', fontSize: '0.7rem' }}>
                        {format(new Date(tx.date), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{
                    color: tx.type === 'income' ? '#38ef7d' : '#f87171'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
