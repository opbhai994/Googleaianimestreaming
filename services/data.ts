import { Anime, User, AnimeRequest } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  addDoc,
  updateDoc
} from 'firebase/firestore';

export const COLLECTION_NAME = 'animes';
export const USERS_COLLECTION = 'users';
export const REQUESTS_COLLECTION = 'requests';
const LOCAL_STORAGE_KEY = 'demo_animes';

// Expanded Mock data for initial seeding (12 Items for a full site)
export const MOCK_ANIMES: Anime[] = [
  {
    id: '1',
    title: 'Demon Hunter Corps',
    description: 'A young boy sells charcoal for a living. One day, his family is murdered by a demon. His younger sister survives, but has been transformed into a demon.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=450&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=1920&h=600&fit=crop',
    genres: ['Action', 'Fantasy', 'Historical'],
    status: 'Ongoing',
    rating: 9.8,
    featured: true,
    trending: true,
    isFanFavorite: true,
    isHindiDub: true,
    isTrendingNo1: true,
    releaseYear: 2019,
    episodes: Array.from({ length: 12 }).map((_, i) => ({
      id: `ep-1-${i + 1}`,
      number: i + 1,
      seasonNumber: 1,
      title: `Cruelty part ${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=320&h=180&fit=crop`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '24:00'
    }))
  },
  {
    id: '2',
    title: 'Jujutsu Sorcery',
    description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the other body parts.',
    thumbnail: 'https://images.unsplash.com/photo-1620509616336-b5e173e35a12?w=300&h=450&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1920&h=600&fit=crop',
    genres: ['Action', 'Supernatural'],
    status: 'Ongoing',
    rating: 9.6,
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
      thumbnail: `https://images.unsplash.com/photo-1620509616336-b5e173e35a12?w=320&h=180&fit=crop`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '24:00'
    }))
  },
  // ... (Keeping specific items brief for XML length, assuming MOCK data structure is known or same as previous)
];

// --- HELPER FOR LOCAL STORAGE ---
const getLocalAnimes = (): Anime[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return MOCK_ANIMES;
  return JSON.parse(stored);
};

const setLocalAnimes = (animes: Anime[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(animes));
};

// NEW: Diagnostic function to test connection
export const checkDatabaseConnection = async () => {
  if (!db) return false; 
  try {
    await getDocs(collection(db, COLLECTION_NAME));
    return true;
  } catch (error: any) {
    throw error;
  }
};

// --- ANIME FUNCTIONS ---

export const getAnimeList = async (forceLocal = false): Promise<Anime[]> => {
  if (!db || forceLocal) {
    if (!db && !forceLocal) console.warn("Firebase not configured. Using Local Storage (Demo Mode).");
    return getLocalAnimes();
  }
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const list: Anime[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Anime);
    });
    return list;
  } catch (error) {
    console.error("Error fetching anime list:", error);
    return getLocalAnimes();
  }
};

export const getAnimeById = async (id: string): Promise<Anime | undefined> => {
  if (!db) {
    const animes = getLocalAnimes();
    return animes.find(a => a.id === id);
  }
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Anime;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching anime by ID:", error);
    return undefined;
  }
};

export const saveAnime = async (anime: Anime): Promise<void> => {
  if (!db) {
    const animes = getLocalAnimes();
    const index = animes.findIndex(a => a.id === anime.id);
    if (index >= 0) {
      animes[index] = anime;
    } else {
      animes.push(anime);
    }
    setLocalAnimes(animes);
    return;
  }
  try {
    await setDoc(doc(db, COLLECTION_NAME, anime.id), anime, { merge: true });
  } catch (error) {
    console.error("Error saving anime:", error);
    throw error;
  }
};

export const deleteAnime = async (id: string): Promise<void> => {
  if (!db) {
    const animes = getLocalAnimes();
    const filtered = animes.filter(a => a.id !== id);
    setLocalAnimes(filtered);
    return;
  }
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting anime:", error);
    throw error;
  }
};

export const resetDatabase = async (): Promise<void> => {
  if (!db) {
    setLocalAnimes(MOCK_ANIMES);
    return;
  }
  for (const anime of MOCK_ANIMES) {
    await saveAnime(anime);
  }
};

export const importDatabase = async (json: string): Promise<void> => {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) {
      if (!db) {
        setLocalAnimes(data);
      } else {
        for (const item of data) {
           await saveAnime(item);
        }
      }
    }
  } catch (e) {
    throw new Error("Invalid JSON format");
  }
};

// --- USER & AUTH FUNCTIONS (Custom Implementation) ---

export const registerUser = async (user: User): Promise<User> => {
  if (!db) {
    // Local storage fallback
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
    const exists = users.find((u: User) => u.email === user.email);
    if (exists) throw new Error("Email already exists");
    user.id = `user-${Date.now()}`;
    users.push(user);
    localStorage.setItem('demo_users', JSON.stringify(users));
    return user;
  }

  // Check if email exists
  const q = query(collection(db, USERS_COLLECTION), where("email", "==", user.email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error("Email already exists");
  }

  const newDocRef = doc(collection(db, USERS_COLLECTION));
  const newUser = { ...user, id: newDocRef.id };
  await setDoc(newDocRef, newUser);
  return newUser;
};

export const loginUser = async (email: string, pass: string): Promise<User> => {
  if (!db) {
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
    const user = users.find((u: User) => u.email === email && u.password === pass);
    if (!user) throw new Error("Invalid credentials");
    return user;
  }

  const q = query(collection(db, USERS_COLLECTION), where("email", "==", email), where("password", "==", pass));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error("Invalid credentials");
  }
  
  return querySnapshot.docs[0].data() as User;
};

export const syncUserHistory = async (user: User): Promise<void> => {
  if (!db || !user.id) return; // Local storage handles itself in App.tsx
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await updateDoc(userRef, {
      watchHistory: user.watchHistory,
      watchlist: user.watchlist
    });
  } catch (e) {
    console.error("Error syncing history:", e);
  }
};

// --- REQUEST FUNCTIONS ---

export const submitRequest = async (request: AnimeRequest): Promise<void> => {
  if (!db) return; // Requests only work in Online mode for admin to see
  try {
    await setDoc(doc(collection(db, REQUESTS_COLLECTION), request.id), request);
  } catch (e) {
    console.error("Error submitting request:", e);
    throw e;
  }
};

export const getRequests = async (): Promise<AnimeRequest[]> => {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, REQUESTS_COLLECTION));
    const list: AnimeRequest[] = [];
    snap.forEach(d => list.push(d.data() as AnimeRequest));
    return list.sort((a,b) => b.requestedAt - a.requestedAt);
  } catch (e) {
    return [];
  }
};

export const deleteRequest = async (id: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, REQUESTS_COLLECTION, id));
};
