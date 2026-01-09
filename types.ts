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
  isFanFavorite?: boolean;
  isHindiDub?: boolean;
  isTrendingNo1?: boolean;
  releaseYear?: number;
}

export interface User {
  id?: string; // Firestore Doc ID
  name?: string;
  email: string;
  password?: string; // Storing for simple auth demo (Note: In production, use Firebase Auth)
  isAdmin: boolean;
  watchlist: string[]; // Array of Anime IDs
  watchHistory: {
    animeId: string;
    episodeId: string;
    timestamp: number;
  }[];
}

export interface AnimeRequest {
  id: string;
  animeName: string;
  additionalInfo?: string;
  status: 'Pending' | 'Completed';
  requestedAt: number;
  userId?: string;
  userName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}