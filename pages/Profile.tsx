import React, { useEffect, useState } from 'react';
import { User, Anime } from '../types';
import { getAnimeById } from '../services/data';
import { Link, Navigate } from 'react-router-dom';
import { Clock, PlayCircle, Bookmark, Heart } from 'lucide-react';
import { AnimeCard } from '../components/AnimeCard';

interface ProfileProps {
  user: User | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [historyItems, setHistoryItems] = useState<{anime: Anime, epId: string, timestamp: number}[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<Anime[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'watchlist'>('history');

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch History
        if (user.watchHistory) {
          const promises = user.watchHistory.map(async (h) => {
            const anime = await getAnimeById(h.animeId);
            if (anime) {
              return { anime, epId: h.episodeId, timestamp: h.timestamp };
            }
            return null;
          });
          const results = await Promise.all(promises);
          const validItems = results.filter((item): item is { anime: Anime; epId: string; timestamp: number } => item !== null);
          validItems.sort((a, b) => b.timestamp - a.timestamp);
          setHistoryItems(validItems);
        }

        // Fetch Watchlist
        if (user.watchlist) {
          const promises = user.watchlist.map(async (id) => getAnimeById(id));
          const results = await Promise.all(promises);
          const validAnime = results.filter((item): item is Anime => item !== undefined);
          setWatchlistItems(validAnime);
        }
      }
    };
    
    fetchData();
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-slate-800 pb-8 mb-8">
           <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-3xl font-bold uppercase">
             {user.name ? user.name.charAt(0) : user.email.charAt(0)}
           </div>
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
               {user.name ? user.name : 'My Profile'}
             </h1>
             <p className="text-slate-500 dark:text-gray-400">{user.email}</p>
             {user.isAdmin && <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">ADMINISTRATOR</span>}
           </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-slate-800 mb-8">
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'history' ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><Clock size={18} /> Watch History</span>
          </button>
          <button 
             onClick={() => setActiveTab('watchlist')}
             className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'watchlist' ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><Bookmark size={18} /> My Watchlist</span>
          </button>
        </div>

        {activeTab === 'history' && (
          <div>
            {historyItems.length > 0 ? (
              <div className="space-y-4 animate-fadeIn">
                {historyItems.map((item, idx) => {
                  const episode = item.anime.episodes.find(e => e.id === item.epId);
                  if (!episode) return null;
                  
                  return (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group">
                      <div className="relative w-32 aspect-video flex-shrink-0 rounded-lg overflow-hidden">
                         <img src={episode.thumbnail} alt={episode.title} className="w-full h-full object-cover"/>
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="text-white" size={24} />
                         </div>
                      </div>
                      <div className="flex flex-col justify-center">
                         <Link to={`/anime/${item.anime.id}`} className="text-sm text-brand-500 font-semibold hover:underline">
                           {item.anime.title}
                         </Link>
                         <Link to={`/watch/${item.anime.id}/${item.epId}`} className="text-lg font-bold text-slate-800 dark:text-gray-100 hover:text-brand-500">
                           Ep {episode.number}: {episode.title}
                         </Link>
                         <span className="text-xs text-slate-400 mt-1">Watched on {new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-800">
                 <p>You haven't watched anything yet.</p>
                 <Link to="/browse" className="text-brand-500 font-bold mt-2 inline-block">Start Exploring</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            {watchlistItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fadeIn">
                {watchlistItems.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-800">
                 <Bookmark size={48} className="mx-auto mb-4 opacity-20"/>
                 <p className="text-lg font-medium">Your watchlist is empty.</p>
                 <p className="text-sm">Save shows here to watch them later.</p>
                 <Link to="/browse" className="text-brand-500 font-bold mt-4 inline-block">Browse Anime</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};