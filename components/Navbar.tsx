import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User as UserIcon, LogOut, Shield, Globe, X } from 'lucide-react';
import { User, Anime } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  animeList?: Anime[]; // Optional to prevent breaking if not passed immediately
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, animeList = [], onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('HI');
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = searchQuery.length > 1 
    ? animeList.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">AI</div>
            <span className="hidden sm:block text-xl font-black tracking-tighter text-brand-500">ANIME INDIA</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6 ml-6 text-sm font-bold uppercase tracking-wider text-gray-300">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <Link to="/browse" className="hover:text-brand-500 transition-colors">Browse</Link>
            <Link to="/trending" className="hover:text-brand-500 transition-colors">Trending</Link>
          </div>
        </div>

        {/* Search Bar with Suggestions */}
        <div className="flex-1 max-w-md hidden sm:block relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for anime, characters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-900 border-none rounded-md py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-500 text-white transition-all"
            />
            {searchQuery ? (
               <button type="button" onClick={() => { setSearchQuery(''); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                 <X size={16} />
               </button>
            ) : (
               <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors">
                 <Search size={18} />
               </button>
            )}
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
               {filteredSuggestions.length > 0 ? (
                 <ul>
                   {filteredSuggestions.map(anime => (
                     <li key={anime.id}>
                       <Link 
                         to={`/anime/${anime.id}`} 
                         onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                         className="flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                       >
                         <img src={anime.thumbnail} alt={anime.title} className="w-10 h-14 object-cover rounded" />
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-100 line-clamp-1">{anime.title}</span>
                           <span className="text-xs text-gray-400">{anime.releaseYear} • {anime.rating} ★</span>
                         </div>
                       </Link>
                     </li>
                   ))}
                   <li className="p-2 bg-slate-950 text-center">
                     <button onClick={handleSearch} className="text-xs text-brand-500 font-bold uppercase tracking-wider hover:underline">
                        View All Results
                     </button>
                   </li>
                 </ul>
               ) : (
                 <div className="p-4 text-center text-gray-500 text-sm">
                   No results found for "{searchQuery}"
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setLang(prev => prev === 'EN' ? 'HI' : 'EN')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-gray-400 hover:border-brand-500 transition-colors"
          >
            <Globe size={14} /> {lang}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
               {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 items-center !rounded-full text-xs py-1.5">
                     <Shield size={14}/> Admin
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white border-2 border-slate-800 font-bold uppercase shadow-sm">
                  {user.name ? user.name.charAt(0) : (user.email ? user.email.charAt(0) : <UserIcon size={18} />)}
                </div>
              </Link>
              <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm font-bold">LOG IN</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="hidden md:flex text-sm font-bold shadow-none !rounded-full px-5">SIGN UP</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 p-4 space-y-4 animate-fadeIn">
          <form onSubmit={handleSearch} className="relative">
             <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 rounded-lg py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-white"
            />
          </form>
          <div className="flex flex-col gap-4 text-sm font-bold tracking-wide uppercase text-gray-300 pl-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/browse" onClick={() => setIsMenuOpen(false)}>Browse Anime</Link>
            <Link to="/trending" onClick={() => setIsMenuOpen(false)}>Trending</Link>
            {user?.isAdmin && <Link to="/admin" className="text-brand-500" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
            {!user && <Link to="/signup" className="text-brand-500" onClick={() => setIsMenuOpen(false)}>Sign Up Free</Link>}
          </div>
        </div>
      )}
    </nav>
  );
};