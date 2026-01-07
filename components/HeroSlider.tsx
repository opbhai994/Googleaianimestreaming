import React, { useState, useEffect } from 'react';
import { Anime } from '../types';
import { Play, Info, Languages, Flame } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

interface HeroSliderProps {
  featured: Anime[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ featured }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!featured || featured.length === 0) return null;

  const currentAnime = featured[currentIndex];
  const firstEpisodeId = currentAnime.episodes.length > 0 ? currentAnime.episodes[0].id : null;

  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden bg-slate-900">
      {/* Background Image with Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${currentAnime.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Trending #1 Tag */}
              {currentAnime.isTrendingNo1 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-wider rounded-sm shadow-lg shadow-yellow-500/20 animate-pulse">
                  <Flame size={14} fill="currentColor" /> Trending #1
                </span>
              )}
              
              <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                Featured
              </span>
              
              {currentAnime.isHindiDub && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md text-brand-400 text-xs font-bold uppercase tracking-wider rounded-sm border border-brand-400/30 shadow-lg">
                  <Languages size={14} /> Hindi Dubbed
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {currentAnime.title}
            </h1>
            <div className="flex gap-2 text-gray-300 text-sm font-medium">
              <span className="text-brand-400">★ {currentAnime.rating}</span>
              <span>•</span>
              <span>{currentAnime.genres.join(' | ')}</span>
              <span>•</span>
              <span>{currentAnime.episodes.length} Episodes</span>
            </div>
            <p className="text-gray-200 line-clamp-3 md:line-clamp-4 text-sm md:text-lg max-w-xl drop-shadow-md">
              {currentAnime.description}
            </p>
            <div className="flex gap-4 pt-4">
              {firstEpisodeId ? (
                <Link to={`/watch/${currentAnime.id}/${firstEpisodeId}`}>
                  <Button size="lg" className="gap-2">
                    <Play fill="currentColor" size={20} />
                    Start Watching
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="gap-2 opacity-50 cursor-not-allowed" disabled>
                  <Play fill="currentColor" size={20} />
                  No Episodes
                </Button>
              )}
              <Link to={`/anime/${currentAnime.id}`}>
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 gap-2 border border-white/20">
                  <Info size={20} />
                  Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-brand-500' : 'w-2 bg-gray-500 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};