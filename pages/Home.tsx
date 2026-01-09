import React, { useMemo } from 'react';
import { Anime, User } from '../types';
import { HeroSlider } from '../components/HeroSlider';
import { AnimeCard } from '../components/AnimeCard';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, TrendingUp, Languages, Heart, Clock, MessageSquare } from 'lucide-react';

interface HomeProps {
  animeList: Anime[];
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ animeList, user }) => {
  const navigate = useNavigate();

  // Prioritize Trending #1 items, then standard featured items
  const featured = useMemo(() => {
    return animeList
      .filter(a => a.featured || a.isTrendingNo1)
      .sort((a, b) => (b.isTrendingNo1 ? 1 : 0) - (a.isTrendingNo1 ? 1 : 0));
  }, [animeList]);
  
  // Note: These lists are now curated via the "Home Layout" tab in Admin (by toggling flags)
  const trending = useMemo(() => animeList.filter(a => a.trending).slice(0, 10), [animeList]);
  const hindiDubbed = useMemo(() => animeList.filter(a => a.isHindiDub).slice(0, 10), [animeList]);
  const fanFavorites = useMemo(() => animeList.filter(a => a.isFanFavorite).slice(0, 10), [animeList]);

  const continueWatching = useMemo(() => {
    if (!user || !user.watchHistory || user.watchHistory.length === 0) return [];
    
    return [...user.watchHistory]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(historyItem => {
        const anime = animeList.find(a => a.id === historyItem.animeId);
        if (!anime) return null;
        
        const episode = anime.episodes.find(e => e.id === historyItem.episodeId);
        
        return {
          anime,
          episode,
          // Link directly to the specific episode, or anime page if ep missing
          link: episode ? `/watch/${anime.id}/${episode.id}` : `/anime/${anime.id}`,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 6); // Limit to top 6 recently watched
  }, [user, animeList]);

  return (
    <div className="min-h-screen pb-20">
      <HeroSlider featured={featured} />

      <div className="container mx-auto px-4 mt-12 space-y-16">
        
        {/* Request Anime Banner */}
        <div className="rounded-2xl overflow-hidden relative h-40 md:h-32 flex items-center bg-slate-900 border border-slate-800 shadow-xl p-6 md:p-8">
           <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-brand-500 skew-x-12 transform translate-x-10"></div>
           <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-500/20 text-brand-500 rounded-xl">
                    <MessageSquare size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Can't find your anime?</h3>
                    <p className="text-gray-400 text-sm">Tell us what to add next to our library.</p>
                 </div>
              </div>
              <Button onClick={() => navigate('/request')} className="w-full md:w-auto px-8 py-3 whitespace-nowrap">
                 Request Anime
              </Button>
           </div>
        </div>

        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                  <Clock size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Continue Watching</h2>
                   <p className="text-sm text-slate-500 dark:text-gray-400">Pick up where you left off</p>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="uppercase text-xs tracking-wider">View History</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {continueWatching.map(({ anime, episode, link }) => (
                <AnimeCard 
                  key={`history-${anime.id}`} 
                  anime={anime} 
                  link={link}
                  subtitle={
                    <span className="text-brand-500 font-bold flex items-center gap-1">
                      <Clock size={12} /> {episode ? `Episode ${episode.number}` : 'Continue'}
                    </span>
                  }
                />
              ))}
            </div>
          </section>
        )}

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
                   <p className="text-sm text-slate-500 dark:text-gray-400">Top 10 most popular</p>
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
                   <p className="text-sm text-slate-500 dark:text-gray-400">Top picks in your language</p>
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
                   <p className="text-sm text-slate-500 dark:text-gray-400">Top rated by community</p>
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