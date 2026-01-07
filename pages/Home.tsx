import React, { useMemo } from 'react';
import { Anime } from '../types';
import { HeroSlider } from '../components/HeroSlider';
import { AnimeCard } from '../components/AnimeCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, Languages, Heart } from 'lucide-react';

interface HomeProps {
  animeList: Anime[];
}

export const Home: React.FC<HomeProps> = ({ animeList }) => {
  const featured = useMemo(() => animeList.filter(a => a.featured), [animeList]);
  const trending = useMemo(() => animeList.filter(a => a.trending).slice(0, 12), [animeList]);
  const hindiDubbed = useMemo(() => animeList.filter(a => a.isHindiDub).slice(0, 12), [animeList]);
  const fanFavorites = useMemo(() => animeList.filter(a => a.isFanFavorite).slice(0, 12), [animeList]);

  return (
    <div className="min-h-screen pb-20">
      <HeroSlider featured={featured} />

      <div className="container mx-auto px-4 mt-12 space-y-16">
        
        {/* Trending Section */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     Trending Series <Flame className="text-orange-500" fill="currentColor" size={20} />
                   </h2>
                   <p className="text-sm text-slate-500 dark:text-gray-400">What everyone is talking about</p>
                </div>
              </div>
              <Link to="/trending">
                <Button variant="ghost" size="sm" className="uppercase text-xs tracking-wider">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {trending.map(anime => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* New Hindi Dubbed Section */}
        {hindiDubbed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                  <Languages size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hindi Dubbed</h2>
                   <p className="text-sm text-slate-500 dark:text-gray-400">Anime in your favorite language</p>
                </div>
              </div>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="uppercase text-xs tracking-wider">Explore All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {hindiDubbed.map(anime => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Fan Favorites Section */}
        {fanFavorites.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                  <Heart size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fan Favorites</h2>
                   <p className="text-sm text-slate-500 dark:text-gray-400">Top picks by the AI community</p>
                </div>
              </div>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="uppercase text-xs tracking-wider">See More</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {fanFavorites.map(anime => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Promo Banner */}
        <div className="rounded-2xl overflow-hidden relative h-64 flex items-center bg-gradient-to-r from-brand-600 to-orange-400 shadow-xl">
           <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[url('https://picsum.photos/seed/pattern/800/600')] bg-cover mix-blend-overlay"></div>
           <div className="p-8 md:p-12 relative z-10 max-w-xl">
             <h3 className="text-3xl font-bold text-white mb-2">Premium Access</h3>
             <p className="text-white/90 mb-6">Enjoy ad-free streaming, offline viewing, and simulcasts one hour after Japan.</p>
             <Button className="!bg-white !text-brand-600 hover:!bg-gray-100 border-0 font-black px-8 shadow-lg">
                Try Premium Free
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};