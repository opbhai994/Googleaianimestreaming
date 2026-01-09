import { useState, useEffect, useCallback } from 'react';
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
import { RequestAnime } from './pages/RequestAnime';
import { getAnimeList, checkDatabaseConnection, resetDatabase, syncUserHistory } from './services/data';
import { isFirebaseInitialized } from './services/firebase';
import { User, Anime } from './types';
import { AlertTriangle, Settings, ExternalLink, EyeOff, Database, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Button } from './components/Button';

// Force new build hash
console.log("Anime India App v2.0 - Features Update");

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // If Firebase keys are missing AND not in demo mode, show setup screen
  if (!isFirebaseInitialized && !demoMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/50 max-w-2xl shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Configuration Required</h1>
          <p className="text-gray-300 mb-6 text-lg">
            To enable the Cloud Database, you must configure your Firebase keys in <code>services/firebase.ts</code>.
          </p>
          
          <div className="bg-black/50 p-6 rounded-lg text-left space-y-4 font-mono text-sm text-gray-400 mb-8 border border-slate-800">
            <p className="text-brand-500 font-bold">1. Open file:</p>
            <p className="text-white">services/firebase.ts</p>
            
            <p className="text-brand-500 font-bold mt-4">2. Replace placeholders:</p>
            <div className="pl-4 border-l-2 border-slate-700">
               apiKey: "REPLACE_WITH_YOUR_API_KEY",<br/>
               projectId: "REPLACE_WITH_YOUR_PROJECT_ID",<br/>
               ...
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
               <Button className="gap-2">
                 <ExternalLink size={18} /> Open Firebase Console
               </Button>
             </a>
             <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
               <Settings size={18} /> I Have Updated It
             </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
             <button onClick={() => setDemoMode(true)} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors">
                <EyeOff size={16} /> Preview in Demo Mode (Offline Storage)
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Firebase Database Errors
  if (isFirebaseInitialized && dbError && !demoMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 p-8 rounded-2xl border border-orange-500/50 max-w-2xl shadow-2xl">
          <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Database Connection Failed</h1>
          <p className="text-orange-400 font-bold mb-4">Keys are valid, but the database is unreachable.</p>
          
          <div className="bg-black/50 p-4 rounded-lg text-left font-mono text-xs text-red-300 mb-8 border border-red-900/50 overflow-auto max-h-32">
             Error: {dbError}
          </div>

          <div className="text-gray-300 mb-6 text-lg text-left space-y-2">
            <p><strong>Common Fix:</strong> You created the Project, but not the <em>Database</em>.</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-400">
              <li>Go to <a href="https://console.firebase.google.com" className="text-brand-500 hover:underline">Firebase Console</a> → Build → Firestore Database.</li>
              <li>Click <strong>Create Database</strong>.</li>
              <li>Choose a location (e.g. <em>nam5</em> or <em>asia-south1</em>).</li>
              <li><strong>Important:</strong> Select "Start in <strong>Test Mode</strong>".</li>
            </ol>
          </div>

          <div className="flex gap-4 justify-center">
             <Button onClick={() => window.location.reload()} className="gap-2">
               <Settings size={18} /> Retry Connection
             </Button>
             <button onClick={() => setDemoMode(true)} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 px-4 py-2">
                <EyeOff size={16} /> Use Demo Mode Instead
             </button>
          </div>
        </div>
      </div>
    );
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    
    if (demoMode) {
      const data = await getAnimeList(true); 
      setAnimeList(data);
      setLoading(false);
      return;
    }

    try {
      if (isFirebaseInitialized) {
         try {
           await checkDatabaseConnection();
         } catch (e: any) {
           console.error("DB Connection Check Failed:", e);
           if (e.code === 'permission-denied' || e.code === 'not-found' || e.code === 'unavailable' || e.message.includes('offline')) {
             setDbError(e.message);
             setLoading(false);
             return;
           }
         }
      }
      const data = await getAnimeList();
      setAnimeList(data);
    } catch (e) {
      console.error("Data fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchData();
    
    const savedUser = localStorage.getItem('anime_india_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.watchlist) parsedUser.watchlist = [];
      setUser(parsedUser);
    }
  }, [fetchData]);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('anime_india_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('anime_india_user');
  };

  const addToHistory = useCallback(async (animeId: string, episodeId: string) => {
    if (!user) return;
    
    const entry = { animeId, episodeId, timestamp: Date.now() };
    
    // Optimistic Update
    const updatedUser = { 
        ...user, 
        watchHistory: [...user.watchHistory.filter(h => h.animeId !== animeId), entry] 
    };
    setUser(updatedUser);
    localStorage.setItem('anime_india_user', JSON.stringify(updatedUser));

    // Sync to Cloud
    await syncUserHistory(updatedUser);

  }, [user]);

  const toggleWatchlist = useCallback(async (animeId: string) => {
    if (!user) return;

    const currentList = user.watchlist || [];
    let newList;
    if (currentList.includes(animeId)) {
      newList = currentList.filter(id => id !== animeId);
    } else {
      newList = [...currentList, animeId];
    }
    
    const updatedUser = { ...user, watchlist: newList };
    setUser(updatedUser);
    localStorage.setItem('anime_india_user', JSON.stringify(updatedUser));

    // Sync to Cloud
    await syncUserHistory(updatedUser);
  }, [user]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await resetDatabase();
      await fetchData(); 
    } catch (e: any) {
      alert("Error uploading data: " + e.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading && animeList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // --- Handle Connected but Empty Database State ---
  if (!loading && animeList.length === 0 && isFirebaseInitialized && !demoMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
        <div className="bg-slate-900 p-8 rounded-2xl border border-green-500/50 max-w-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-brand-500"></div>
          
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 size={40} />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2">Cloud Database Connected!</h1>
          <p className="text-green-400 font-bold mb-6 uppercase tracking-wider text-sm">System Ready for Initialization</p>
          
          <div className="text-gray-300 mb-8 space-y-4 max-w-lg mx-auto leading-relaxed">
            <p>
              Excellent! Your web app is successfully talking to Google Firebase.
            </p>
            <p className="text-sm bg-black/40 p-4 rounded-lg border border-slate-800 text-gray-400">
               <strong>Next Step:</strong> Your database is currently empty. Click the button below to upload the starter anime content so you can test the site.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
             <Button onClick={handleSeedData} disabled={seeding || loading} className="w-full gap-2 py-3 text-lg shadow-green-500/20 shadow-lg !bg-green-600 hover:!bg-green-500 border-0">
               {seeding ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <UploadCloud size={20} />}
               {seeding ? 'Initializing Database...' : 'Initialize Database (One-Time)'}
             </Button>
             
             <button onClick={() => setDemoMode(true)} className="text-gray-500 hover:text-white text-xs mt-2 transition-colors">
                Skip for now (I will add data manually)
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-gray-100">
        {!isFirebaseInitialized && demoMode && (
          <div className="bg-brand-600 text-white text-xs font-bold text-center py-1">
             DEMO MODE: Changes are saved to your browser (LocalStorage) only. Configure Firebase to enable cloud sync.
          </div>
        )}
        <Navbar user={user} onLogout={handleLogout} animeList={animeList} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home animeList={animeList} user={user} />} />
            <Route path="/browse" element={<Browse animeList={animeList} />} />
            <Route path="/trending" element={<Trending animeList={animeList} />} />
            <Route path="/request" element={<RequestAnime user={user} />} />
            <Route path="/anime/:id" element={<AnimeDetails user={user} onToggleWatchlist={toggleWatchlist} />} />
            <Route path="/watch/:animeId/:episodeId" element={<Watch user={user} updateHistory={addToHistory} />} />
            <Route path="/login" element={<Login onLogin={handleAuthSuccess} />} />
            <Route path="/signup" element={<SignUp onSignUp={handleAuthSuccess} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/admin" element={<Admin user={user} animeList={animeList} refreshData={fetchData} />} />
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