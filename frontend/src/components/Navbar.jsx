import { Link } from 'react-router-dom';
import { PieChart, List } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Personal Budget Tracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <PieChart className="w-5 h-5 mr-1" />
              Dashboard
            </Link>
            <Link to="/transactions" className="flex items-center px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <List className="w-5 h-5 mr-1" />
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
