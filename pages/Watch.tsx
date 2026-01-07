
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Anime, Episode, User } from '../types';
import { getAnimeById } from '../services/data';
import { ChevronRight, ChevronLeft, List, Server, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

interface WatchProps {
  user: User | null;
  updateHistory: (animeId: string, episodeId: string) => void;
}

export const Watch: React.FC<WatchProps> = ({ user, updateHistory }) => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const [anime, setAnime] = useState<Anime | undefined>();
  const [currentEp, setCurrentEp] = useState<Episode | undefined>();
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<string>('Main');
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (animeId && episodeId) {
        setFetching(true);
        setLoading(true);
        const data = await getAnimeById(animeId);
        if (data) {
          setAnime(data);
          const ep = data.episodes.find(e => e.id === episodeId);
          setCurrentEp(ep);
          if (ep) {
            setSelectedSeason(ep.seasonNumber);
          }
        }
        setFetching(false);
      }
    };
    fetch();
  }, [animeId, episodeId]);

  useEffect(() => {
    if (user && animeId && episodeId && currentEp) {
      updateHistory(animeId, episodeId);
    }
  }, [animeId, episodeId, !!user, updateHistory, currentEp]); 

  const seasons = useMemo(() => {
    if (!anime) return [];
    // Fix: Explicitly type sort parameters to avoid arithmetic operation errors
    return Array.from(new Set(anime.episodes.map(e => e.seasonNumber))).sort((a: number, b: number) => a - b);
  }, [anime]);

  const visibleEpisodes = useMemo(() => {
    if (!anime) return [];
    return anime.episodes
      .filter(e => e.seasonNumber === selectedSeason)
      .sort((a, b) => a.number - b.number);
  }, [anime, selectedSeason]);

  const activeVideoUrl = useMemo(() => {
    if (!currentEp) return '';
    if (server === 'Backup') return currentEp.backupUrl || currentEp.videoUrl;
    if (server === 'Mirror') return currentEp.mirrorUrl || currentEp.videoUrl;
    return currentEp.videoUrl;
  }, [currentEp, server]);

  if (fetching) return (
    <div className="p-20 flex justify-center bg-black min-h-screen items-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>
  );

  if (!anime || !currentEp) return <div className="p-20 text-center dark:text-white">Episode not found.</div>;

  const currentIndex = anime.episodes.findIndex(e => e.id === currentEp.id);
  const prevEp = currentIndex > 0 ? anime.episodes[currentIndex - 1] : null;
  const nextEp = currentIndex < anime.episodes.length - 1 ? anime.episodes[currentIndex + 1] : null;

  const handleReload = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col animate-fadeIn">
      <div className="w-full flex-1 max-w-7xl mx-auto p-0 md:p-4 flex flex-col">
        <div className="relative w-full aspect-video bg-gray-900 rounded-none md:rounded-xl overflow-hidden shadow-2xl border border-gray-800 group">
           {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
                <p className="text-gray-400 text-sm">Loading {server} server...</p>
             </div>
           )}

           {activeVideoUrl ? (
             <iframe 
               key={`${currentEp.id}-${server}-${iframeKey}`}
               src={activeVideoUrl} 
               title="Video Player"
               className="w-full h-full"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
               onLoad={() => setLoading(false)}
             ></iframe>
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
               <AlertTriangle className="text-yellow-500 mb-2" size={48} />
               <p className="text-gray-300">Video source unavailable on {server} server.</p>
             </div>
           )}
        </div>

        <div className="bg-gray-900/50 p-3 md:rounded-b-xl border-x border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Server size={16} />
                <span className="hidden sm:inline">Switch Server:</span>
              </div>
              <div className="flex gap-2">
                 {[
                   { id: 'Main', available: true },
                   { id: 'Backup', available: !!currentEp.backupUrl },
                   { id: 'Mirror', available: !!currentEp.mirrorUrl }
                 ].map((srv) => (
                   <button 
                     key={srv.id}
                     disabled={!srv.available}
                     onClick={() => { setServer(srv.id); handleReload(); }}
                     className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                       server === srv.id 
                       ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                       : srv.available 
                         ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                         : 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                     }`}
                   >
                     {srv.id}
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button onClick={handleReload} className="text-xs text-gray-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
                <RefreshCcw size={14}/> <span className="hidden sm:inline">Reload Player</span>
              </button>
           </div>
        </div>

        <div className="px-4 md:px-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-8">
             <div>
                <h1 className="text-xl md:text-2xl font-bold text-brand-500">
                  Ep {currentEp.number}: {currentEp.title}
                </h1>
                <Link to={`/anime/${anime.id}`} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mt-1">
                   {anime.title} <ChevronRight size={14} />
                </Link>
             </div>
             <div className="flex gap-3">
                <Link to={prevEp ? `/watch/${anime.id}/${prevEp.id}` : '#'} className={!prevEp ? 'pointer-events-none opacity-50' : ''}>
                   <Button variant="secondary" size="sm" disabled={!prevEp} className="gap-1">
                     <ChevronLeft size={16} /> Prev
                   </Button>
                </Link>
                <Link to={nextEp ? `/watch/${anime.id}/${nextEp.id}` : '#'} className={!nextEp ? 'pointer-events-none opacity-50' : ''}>
                   <Button variant="primary" size="sm" disabled={!nextEp} className="gap-1">
                     Next <ChevronRight size={16} />
                   </Button>
                </Link>
             </div>
          </div>
        </div>

        <div className="px-4 md:px-0 pb-12">
           <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <List size={20} className="text-brand-500" />
                <h3 className="font-semibold text-lg">Episodes</h3>
              </div>
              
              {seasons.length > 1 && (
                <div className="flex flex-wrap gap-2">
                   {seasons.map(s => (
                     <button
                        key={s}
                        onClick={() => setSelectedSeason(s)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                          selectedSeason === s 
                          ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-brand-500'
                        }`}
                     >
                       Season {s}
                     </button>
                   ))}
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {visibleEpisodes.map(ep => (
                <Link 
                  key={ep.id} 
                  to={`/watch/${anime.id}/${ep.id}`}
                  className={`p-3 rounded-lg border transition-all flex flex-col gap-1 group ${
                    ep.id === currentEp.id 
                    ? 'bg-brand-500/10 border-brand-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                    : 'bg-gray-900 border-gray-800 hover:bg-gray-800 hover:border-brand-500/50'
                  }`}
                >
                   <div className="flex justify-between items-center">
                     <span className={`text-[10px] font-bold uppercase ${ep.id === currentEp.id ? 'text-brand-500' : 'text-gray-500'}`}>
                       Ep {ep.number}
                     </span>
                     {ep.id === currentEp.id && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
                   </div>
                   <span className={`text-sm font-medium truncate ${ep.id === currentEp.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                     {ep.title}
                   </span>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
