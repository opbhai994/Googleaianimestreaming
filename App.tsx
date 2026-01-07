import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Trending } from './pages/Trending';
import { AnimeDetails } from './pages/AnimeDetails';
import { Watch } from './pages/Watch';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { getAnimeList } from './services/data';
import { User, Anime } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnimeList();
      setAnimeList(data);
    } catch (e) {
      console.error("Data fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Check local storage for existing session
    const savedUser = localStorage.getItem('anime_india_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [fetchData]);

  const handleLogin = (email: string, pass: string) => {
    // Basic local login simulation
    const newUser: User = {
      name: email.split('@')[0],
      email: email,
      isAdmin: email === 'bk.9041442950@gmail.com',
      watchHistory: []
    };
    setUser(newUser);
    localStorage.setItem('anime_india_user', JSON.stringify(newUser));
    return true;
  };

  const handleSignUp = (name: string, email: string, pass: string) => {
    const newUser: User = {
      name,
      email,
      isAdmin: email === 'bk.9041442950@gmail.com',
      watchHistory: []
    };
    setUser(newUser);
    localStorage.setItem('anime_india_user', JSON.stringify(newUser));
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('anime_india_user');
  };

  const addToHistory = useCallback((animeId: string, episodeId: string) => {
    if (!user) return;
    
    const entry = { animeId, episodeId, timestamp: Date.now() };
    
    setUser(prev => {
      if (!prev) return null;
      const history = prev.watchHistory;
      // Don't add if same episode was already the last entry
      if (history.length > 0 && history[history.length - 1].animeId === animeId && history[history.length - 1].episodeId === episodeId) {
        return prev;
      }
      
      const updatedUser = { 
        ...prev, 
        watchHistory: [...prev.watchHistory.filter(h => h.animeId !== animeId), entry] 
      };
      localStorage.setItem('anime_india_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, [user]);

  const refreshData = async () => {
    await fetchData();
  };

  if (loading && animeList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-gray-100">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home animeList={animeList} user={user} />} />
            <Route path="/browse" element={<Browse animeList={animeList} />} />
            <Route path="/trending" element={<Trending animeList={animeList} />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:animeId/:episodeId" element={<Watch user={user} updateHistory={addToHistory} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/admin" element={<Admin user={user} animeList={animeList} refreshData={refreshData} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Anime India. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;