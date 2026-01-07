import React from 'react';
import { Anime } from '../types';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnimeCardProps {
  anime: Anime;
  link?: string;
  subtitle?: React.ReactNode;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, link, subtitle }) => {
  const targetLink = link || `/anime/${anime.id}`;

  return (
    <Link to={targetLink} className="group relative flex flex-col gap-2 w-full max-w-[200px] mx-auto cursor-pointer">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-brand-500/20">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-brand-500 rounded-full p-3 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
            <Play fill="currentColor" size={24} />
          </div>
        </div>
        
        {/* Badges Container */}
        <div className="absolute top-2 left-0 right-0 px-2 flex flex-col gap-1 items-start pointer-events-none">
          {/* Status Badge */}
          <div className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-r-md backdrop-blur-md shadow-lg border-l-2 ${
            anime.status === 'Ongoing' 
            ? 'bg-blue-600/90 text-white border-blue-400' 
            : 'bg-slate-900/80 text-gray-300 border-slate-700'
          }`}>
            {anime.status}
          </div>
          
          {/* Hindi Dub Badge */}
          {anime.isHindiDub && (
            <div className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-brand-500/90 text-white rounded-r-md backdrop-blur-md shadow-lg border-l-2 border-brand-300">
              Hindi Dub
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm md:text-base font-semibold text-slate-800 dark:text-gray-100 line-clamp-1 group-hover:text-brand-500 transition-colors">
          {anime.title}
        </h3>
        <div className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">
          {subtitle || anime.genres.slice(0, 2).join(', ')}
        </div>
      </div>
    </Link>
  );
};