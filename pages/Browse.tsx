import React, { useState, useEffect, useMemo } from 'react';
import { Anime } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface BrowseProps {
  animeList: Anime[];
}

type SortOption = 'rating-desc' | 'rating-asc' | 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc';

export const Browse: React.FC<BrowseProps> = ({ animeList }) => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');

  // Extract unique genres
  const allGenres = useMemo(() => ['All', ...Array.from(new Set(animeList.flatMap(a => a.genres)))], [animeList]);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearch(query);
  }, [searchParams]);

  const filteredAndSortedAnime = useMemo(() => {
    let results = animeList.filter(anime => {
      const matchesSearch = anime.title.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || anime.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });

    // Sorting Logic
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'year-desc':
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case 'year-asc':
          return (a.releaseYear || 0) - (b.releaseYear || 0);
        default:
          return 0;
      }
    });

    return results;
  }, [animeList, search, selectedGenre, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Browse Anime</h1>
           <p className="text-slate-500 dark:text-gray-400">Discover your next favorite series</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg w-full sm:min-w-[240px] focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-4">
            {/* Genre Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg w-full sm:w-auto focus:ring-2 focus:ring-brand-500 outline-none appearance-none dark:text-white cursor-pointer shadow-sm text-sm"
              >
                {allGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg w-full sm:w-auto focus:ring-2 focus:ring-brand-500 outline-none appearance-none dark:text-white cursor-pointer shadow-sm text-sm"
              >
                <option value="rating-desc">Top Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="year-desc">Newest First</option>
                <option value="year-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fadeIn">
          {filteredAndSortedAnime.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
           <Search size={64} className="mb-6 opacity-20"/>
           <p className="text-xl font-medium">No results found.</p>
           <p className="text-sm mt-1">Try adjusting your search or filters.</p>
           <button 
             onClick={() => {setSearch(''); setSelectedGenre('All'); setSortBy('rating-desc');}}
             className="mt-6 px-6 py-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
           >
             Clear All Filters
           </button>
        </div>
      )}
    </div>
  );
};