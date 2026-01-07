import React, { useMemo } from 'react';
import { Anime } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { TrendingUp, Flame } from 'lucide-react';

interface TrendingProps {
  animeList: Anime[];
}

export const Trending: React.FC<TrendingProps> = ({ animeList }) => {
  const trendingAnime = useMemo(() => {
    return animeList.filter(a => a.trending);
  }, [animeList]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
             <TrendingUp size={28} />
          </div>
          <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               Trending Now <Flame className="text-orange-500" fill="currentColor" size={20} />
             </h1>
             <p className="text-slate-500 dark:text-gray-400">Most popular series this week</p>
          </div>
        </div>
        <div className="text-sm bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-full font-bold">
          {trendingAnime.length} Series Trending
        </div>
      </div>

      {trendingAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fadeIn">
          {trendingAnime.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed dark:border-slate-800">
           <TrendingUp size={64} className="mb-6 opacity-10"/>
           <p className="text-xl font-medium">No trending series marked yet.</p>
           <p className="text-sm mt-1">Check back later or browse all anime.</p>
        </div>
      )}

      {/* Recommended section at bottom if trending is sparse */}
      {trendingAnime.length < 6 && (
         <div className="mt-20">
            <h3 className="text-xl font-bold mb-6 dark:text-white opacity-60 uppercase tracking-widest text-sm">You Might Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 opacity-40 hover:opacity-100 transition-opacity">
               {animeList.filter(a => !a.trending).slice(0, 6).map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
               ))}
            </div>
         </div>
      )}
    </div>
  );
};