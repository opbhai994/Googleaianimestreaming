export interface Episode {
  id: string;
  number: number;
  seasonNumber: number;
  title: string;
  thumbnail: string;
  videoUrl: string; // Main Server
  backupUrl?: string; // Backup Server
  mirrorUrl?: string; // Mirror Server
  duration: string;
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  genres: string[];
  status: 'Ongoing' | 'Completed';
  rating: number;
  episodes: Episode[];
  featured?: boolean;
  trending?: boolean;
  isFanFavorite?: boolean; // New field for Home Page "Fan Favorites" section
  isHindiDub?: boolean;
  releaseYear?: number;
}

export interface User {
  name?: string;
  email: string;
  isAdmin: boolean;
  watchHistory: {
    animeId: string;
    episodeId: string;
    timestamp: number;
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}