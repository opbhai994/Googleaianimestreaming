import { Anime } from '../types';

export const STORAGE_KEY = 'anime_india_data';

export const MOCK_ANIMES: Anime[] = [
  {
    id: '1',
    title: 'Demon Hunter Corps',
    description: 'A young boy sells charcoal for a living. One day, his family is murdered by a demon. His younger sister survives, but has been transformed into a demon.',
    thumbnail: 'https://picsum.photos/seed/anime1/300/450',
    coverImage: 'https://picsum.photos/seed/anime1cover/1920/600',
    genres: ['Action', 'Fantasy', 'Historical'],
    status: 'Ongoing',
    rating: 4.9,
    featured: true,
    trending: true,
    isFanFavorite: true,
    isHindiDub: true,
    releaseYear: 2019,
    episodes: Array.from({ length: 12 }).map((_, i) => ({
      id: `ep-1-${i + 1}`,
      number: i + 1,
      seasonNumber: 1,
      title: `Cruelty part ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/ep1-${i}/320/180`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '24:00'
    }))
  },
  {
    id: '2',
    title: 'Jujutsu Sorcery',
    description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the other body parts.',
    thumbnail: 'https://picsum.photos/seed/anime2/300/450',
    coverImage: 'https://picsum.photos/seed/anime2cover/1920/600',
    genres: ['Action', 'Supernatural'],
    status: 'Ongoing',
    rating: 4.8,
    featured: true,
    trending: true,
    isFanFavorite: true,
    isHindiDub: true,
    releaseYear: 2020,
    episodes: Array.from({ length: 24 }).map((_, i) => ({
      id: `ep-2-${i + 1}`,
      number: i + 1,
      seasonNumber: i < 12 ? 1 : 2,
      title: `Incident ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/ep2-${i}/320/180`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '24:00'
    }))
  },
  {
    id: '3',
    title: 'Shadow Monarchy',
    description: 'In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo, notoriously the weakest hunter of all mankind, finds himself in a struggle for survival.',
    thumbnail: 'https://picsum.photos/seed/anime3/300/450',
    coverImage: 'https://picsum.photos/seed/anime3cover/1920/600',
    genres: ['Action', 'Fantasy', 'Adventure'],
    status: 'Ongoing',
    rating: 4.9,
    featured: true,
    trending: true,
    isFanFavorite: true,
    isHindiDub: true,
    releaseYear: 2024,
    episodes: Array.from({ length: 12 }).map((_, i) => ({
      id: `ep-3-${i + 1}`,
      number: i + 1,
      seasonNumber: 1,
      title: `Level Up ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/ep3-${i}/320/180`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '23:45'
    }))
  }
];

const getStoredData = (): Anime[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ANIMES));
    return MOCK_ANIMES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_ANIMES;
  }
};

export const getAnimeList = async (): Promise<Anime[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredData()), 100);
  });
};

export const getAnimeById = async (id: string): Promise<Anime | undefined> => {
  const list = getStoredData();
  return list.find(a => a.id === id);
};

export const saveAnime = async (anime: Anime): Promise<void> => {
  const list = getStoredData();
  const index = list.findIndex(a => a.id === anime.id);
  
  if (index >= 0) {
    list[index] = anime;
  } else {
    list.push(anime);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const deleteAnime = async (id: string): Promise<void> => {
  const list = getStoredData();
  const filtered = list.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const resetDatabase = async (): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ANIMES));
};

export const importDatabase = async (json: string): Promise<void> => {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, json);
    }
  } catch (e) {
    throw new Error("Invalid JSON format");
  }
};