import { Anime, Episode } from '../types';

const KITSU_API_URL = 'https://kitsu.io/api/edge';

export const searchKitsuAnime = async (query: string) => {
  try {
    const response = await fetch(`${KITSU_API_URL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=5`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching from Kitsu:', error);
    return [];
  }
};

export const mapKitsuToAnime = (kitsuItem: any): Anime => {
  const attr = kitsuItem.attributes;
  
  // Create a random ID or use Kitsu ID prefixed
  const id = `kitsu-${kitsuItem.id}`;
  
  return {
    id,
    title: attr.canonicalTitle || attr.titles.en || attr.titles.en_jp,
    description: attr.synopsis || 'No description available.',
    thumbnail: attr.posterImage?.small || attr.posterImage?.original || '',
    coverImage: attr.coverImage?.original || attr.posterImage?.original || '',
    genres: ['Anime'], // Kitsu requires a separate call for genres, defaulting for now
    status: attr.status === 'finished' ? 'Completed' : 'Ongoing',
    rating: parseFloat((attr.averageRating / 20).toFixed(1)) || 0, // Kitsu is 0-100, we want 0-5
    episodes: [], // Episodes need to be added manually or fetched separately
    featured: false,
    isHindiDub: false
  };
};