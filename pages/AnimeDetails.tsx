import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Anime, User } from '../types';
import { getAnimeById } from '../services/data';
import { Play, Star, Calendar, Share2, Plus, Layers, Bookmark, Check } from 'lucide-react';
import { Button } from '../components/Button';

interface AnimeDetailsProps {
  user?: User | null;
  onToggleWatchlist?: (animeId: string) => void;
}

export const AnimeDetails: React.FC<AnimeDetailsProps> = ({ user, onToggleWatchlist }) => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | undefined>();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [visibleEpisodesCount, setVisibleEpisodesCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        setLoading(true);
        const data = await getAnimeById(id);
        if (data) {
          setAnime(data);
          // Fix: Explicitly type sort parameters to avoid arithmetic operation errors
          const seasons = Array.from(new Set(data.episodes.map(e => e.seasonNumber))).sort((a: number, b: number) => a - b);
          if (seasons.length > 0) setSelectedSeason(seasons[0]);
        }
        else navigate('/browse');
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const seasons = useMemo(() => {
    if (!anime) return [];
    // Fix: Explicitly type sort parameters to avoid arithmetic operation errors
    return Array.from(new Set(anime.episodes.map(e => e.seasonNumber))).sort((a: number, b: number) => a - b);
  }, [anime]);

  const seasonEpisodes = useMemo(() => {
    if (!anime) return [];
    return anime.episodes
      .filter(e => e.seasonNumber === selectedSeason)
      .sort((a, b) => a.number - b.number);
  }, [anime, selectedSeason]);

  const isInWatchlist = useMemo(() => {
    if (!user || !user.watchlist || !anime) return false;
    return user.watchlist.includes(anime.id);
  }, [user, anime]);

  if (loading) return (
    <div className="p-20 flex justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>
  );
  
  if (!anime) return <div className="p-10 text-center dark:text-white">Anime not found.</div>;

  const episodesToShow = seasonEpisodes.slice(0, visibleEpisodesCount);
  const hasMoreEpisodes = visibleEpisodesCount < seasonEpisodes.length;

  const handleLoadMore = () => {
    setVisibleEpisodesCount(prev => prev + 12);
  };

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    setVisibleEpisodesCount(12); 
  };

  const handleWatchlistClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (onToggleWatchlist) {
      onToggleWatchlist(anime.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-50 dark:opacity-30"
          style={{ backgroundImage: `url(${anime.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 mx-auto md:mx-0">
             <div className="w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900">
               <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover" />
             </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
             <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white drop-shadow-sm">{anime.title}</h1>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium">
               <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full flex items-center gap-1">
                 <Star size={14} fill="currentColor"/> {anime.rating}
               </span>
               <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                 <Calendar size={14} /> {anime.status}
               </span>
               <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                 <Layers size={14} /> {seasons.length} Seasons
               </span>
               {anime.genres.map(g => (
                 <span key={g} className="border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
                   {g}
                 </span>
               ))}
             </div>

             <p className="text-slate-600 dark:text-gray-300 leading-relaxed max-w-3xl text-lg">
               {anime.description}
             </p>

             <div className="pt-4 flex justify-center md:justify-start gap-4">
               {anime.episodes.length > 0 && (
                 <Link to={`/watch/${anime.id}/${anime.episodes[0].id}`}>
                    <Button size="lg" className="gap-2 px-8">
                      <Play fill="currentColor" size={20} />
                      Watch Now
                    </Button>
                 </Link>
               )}
               
               {/* Watchlist Button */}
               <Button 
                 variant={isInWatchlist ? "outline" : "secondary"} 
                 className={`gap-2 ${isInWatchlist ? "border-green-500 text-green-500 bg-green-500/10" : ""}`}
                 onClick={handleWatchlistClick}
               >
                 {isInWatchlist ? <Check size={18} /> : <Bookmark size={18} />} 
                 {isInWatchlist ? 'Saved' : 'Add to List'}
               </Button>
               
               <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white">
                 <Share2 size={18} />
               </Button>
             </div>
          </div>
        </div>

        <div className="mt-16">
          {seasons.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 border-b dark:border-slate-800 pb-4">
              {seasons.map(s => (
                <button
                  key={s}
                  onClick={() => handleSeasonChange(s)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    selectedSeason === s 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:border-brand-500'
                  }`}
                >
                  Season {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Episodes ({seasonEpisodes.length})
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Season {selectedSeason} • Showing {episodesToShow.length} of {seasonEpisodes.length}
            </span>
          </div>

          {seasonEpisodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
              {episodesToShow.map(ep => (
                <Link to={`/watch/${anime.id}/${ep.id}`} key={ep.id} className="group bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md flex md:flex-col">
                  <div className="relative w-40 md:w-full md:aspect-video flex-shrink-0 overflow-hidden">
                    <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play fill="white" className="text-white" size={32} />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {ep.duration}
                    </span>
                  </div>
                  <div className="p-3 md:p-4 flex flex-col justify-center">
                    <span className="text-xs font-bold text-brand-500 uppercase mb-1">Episode {ep.number}</span>
                    <h4 className="font-semibold text-slate-800 dark:text-gray-200 line-clamp-1 group-hover:text-brand-500 transition-colors">
                      {ep.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed dark:border-slate-800">
               <p className="text-slate-500">No episodes found for Season {selectedSeason}.</p>
            </div>
          )}

          {hasMoreEpisodes && (
            <div className="mt-12 flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore}
                className="gap-2 min-w-[200px] hover:scale-105 transition-transform"
              >
                <Plus size={20} />
                Load More Episodes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};