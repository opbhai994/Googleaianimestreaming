import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User as UserIcon, LogOut, Sun, Moon, Shield } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isDark, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-slate-600 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center text-white font-bold text-lg">AI</div>
            <span className="hidden sm:block text-xl font-bold tracking-tight text-brand-500">AnimeIndia</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 ml-6 text-sm font-semibold text-slate-600 dark:text-gray-300">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <Link to="/browse" className="hover:text-brand-500 transition-colors">Browse</Link>
            <Link to="/trending" className="hover:text-brand-500 transition-colors">Trending</Link>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex relative">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-900 border-none rounded-md py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500">
            <Search size={18} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-300"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
               {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-1 items-center">
                     <Shield size={14}/> Admin
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 font-bold uppercase">
                  {user.name ? user.name.charAt(0) : (user.email ? user.email.charAt(0) : <UserIcon size={18} />)}
                </div>
              </Link>
              <button onClick={onLogout} className="text-slate-500 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="hidden md:flex">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
             <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-900 rounded py-2 px-4 text-sm"
            />
          </form>
          <div className="flex flex-col gap-2 text-slate-600 dark:text-gray-300">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/browse" onClick={() => setIsMenuOpen(false)}>Browse Anime</Link>
            <Link to="/trending" onClick={() => setIsMenuOpen(false)}>Trending</Link>
            {user?.isAdmin && <Link to="/admin" className="text-brand-500" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
          </div>
        </div>
      )}
    </nav>
  );
};