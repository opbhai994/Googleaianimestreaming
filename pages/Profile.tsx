
import React, { useEffect, useState } from 'react';
import { User, Anime } from '../types';
import { getAnimeById } from '../services/data';
import { Link, Navigate } from 'react-router-dom';
import { Clock, PlayCircle } from 'lucide-react';

interface ProfileProps {
  user: User | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [historyItems, setHistoryItems] = useState<{anime: Anime, epId: string, timestamp: number}[]>([]);

  // Fix: Correctly handle asynchronous data fetching inside useEffect
  useEffect(() => {
    const fetchHistory = async () => {
      if (user && user.watchHistory) {
        // Fetch all anime details concurrently
        const promises = user.watchHistory.map(async (h) => {
          const anime = await getAnimeById(h.animeId);
          if (anime) {
            return { anime, epId: h.episodeId, timestamp: h.timestamp };
          }
          return null;
        });
        
        const results = await Promise.all(promises);
        // Filter out any null values where anime might not have been found
        const validItems = results.filter((item): item is { anime: Anime; epId: string; timestamp: number } => item !== null);
        
        // Sort by newest timestamp
        validItems.sort((a, b) => b.timestamp - a.timestamp);
        setHistoryItems(validItems);
      }
    };
    
    fetchHistory();
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

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="text-brand-500"/> Continue Watching
          </h2>
          
          {historyItems.length > 0 ? (
            <div className="space-y-4">
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
      </div>
    </div>
  );
};
