import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50" style={{
      background: 'rgba(15, 15, 26, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Budget<span className="gradient-text">Tracker</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: isActive('/') ? '#e2e8f0' : '#64748b',
                background: isActive('/') ? 'rgba(102, 126, 234, 0.12)' : 'transparent',
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/transactions"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: isActive('/transactions') ? '#e2e8f0' : '#64748b',
                background: isActive('/transactions') ? 'rgba(102, 126, 234, 0.12)' : 'transparent',
              }}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
