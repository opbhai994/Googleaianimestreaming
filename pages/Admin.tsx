import React, { useState, useEffect } from 'react';
import { User, Anime, Episode, AnimeRequest } from '../types';
import { saveAnime, deleteAnime, resetDatabase, importDatabase, getRequests, deleteRequest } from '../services/data';
import { searchKitsuAnime, mapKitsuToAnime } from '../services/kitsu';
import { isFirebaseInitialized } from '../services/firebase';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { 
  DownloadCloud, 
  PlusSquare, 
  PlusCircle, 
  Edit3, 
  LogOut, 
  Search,
  Save,
  Settings,
  Database,
  CloudLightning,
  MonitorPlay,
  Flame,
  Image as ImageIcon,
  Wifi,
  WifiOff,
  Layout,
  MessageSquare,
  Trash2,
  Clock
} from 'lucide-react';

interface AdminProps {
  user: User | null;
  animeList: Anime[];
  refreshData: () => void;
}

type Tab = 'kitsu' | 'upload' | 'home_layout' | 'requests' | 'add_series' | 'edit_series' | 'add_episode' | 'edit_episode' | 'maintenance';

const emptyAnime: Anime = {
  id: '',
  title: '',
  description: '',
  thumbnail: '',
  coverImage: '',
  genres: [],
  status: 'Ongoing',
  rating: 0,
  episodes: [],
  featured: false,
  trending: false,
  isFanFavorite: false,
  isHindiDub: false,
  isTrendingNo1: false
};

const toggleFields = [
  { key: 'isHindiDub', label: 'HINDI DUB' },
  { key: 'featured', label: 'FEATURED' },
  { key: 'trending', label: 'TRENDING' },
  { key: 'isFanFavorite', label: 'FAN FAVORITE' },
  { key: 'isTrendingNo1', label: 'TRENDING #1', highlight: true },
] as const;

export const Admin: React.FC<AdminProps> = ({ user, animeList, refreshData }) => {
  const [activeTab, setActiveTab] = useState<Tab>('kitsu');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [kitsuQuery, setKitsuQuery] = useState('');
  const [kitsuResults, setKitsuResults] = useState<any[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  const [formData, setFormData] = useState<Anime>(emptyAnime);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('');
  
  // Genres state for the input field (comma separated)
  const [genreInput, setGenreInput] = useState('');

  const [episodeData, setEpisodeData] = useState<Partial<Episode>>({ 
    number: 1, 
    seasonNumber: 1, 
    title: '', 
    videoUrl: '', 
    backupUrl: '', 
    mirrorUrl: '', 
    thumbnail: '',
    duration: '24:00' 
  });
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');

  // Maintenance States
  const [jsonInput, setJsonInput] = useState('');

  // Requests State
  const [requests, setRequests] = useState<AnimeRequest[]>([]);

  // Home Layout State
  const [layoutSearch, setLayoutSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const loadRequests = async () => {
    const reqs = await getRequests();
    setRequests(reqs);
  };

  if (!user || !user.isAdmin) return <Navigate to="/" />;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Reset forms when switching to add modes
    if (tab === 'add_series') {
        setFormData(emptyAnime);
        setGenreInput('');
        setSelectedAnimeId('');
    }
  };

  const handleKitsuSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitsuQuery.trim()) return;
    setLoading(true);
    const results = await searchKitsuAnime(kitsuQuery);
    setKitsuResults(results);
    setLoading(false);
  };

  const handleImportKitsu = async (item: any) => {
    setImporting(item.id);
    const newAnime = mapKitsuToAnime(item);
    
    const exists = animeList.find(a => a.title === newAnime.title);
    if (!exists) {
      await saveAnime(newAnime);
      refreshData();
      alert(`Imported: ${newAnime.title}`);
    } else {
      alert('Anime already exists!');
    }
    setImporting(null);
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const id = formData.id || Date.now().toString();
    
    // Process genres from input string
    const processedGenres = genreInput.split(',').map(g => g.trim()).filter(Boolean);
    
    await saveAnime({ ...formData, id, genres: processedGenres });
    await refreshData();
    
    if (activeTab === 'add_series') {
        setFormData(emptyAnime);
        setGenreInput('');
        alert('Series Saved!');
    } else {
        alert('Series Updated!');
    }
    setLoading(false);
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    const anime = animeList.find(a => a.id === selectedAnimeId);
    if (!anime) return;
    setLoading(true);

    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      number: Number(episodeData.number),
      seasonNumber: Number(episodeData.seasonNumber) || 1,
      title: episodeData.title || `Episode ${episodeData.number}`,
      thumbnail: episodeData.thumbnail || anime.thumbnail, 
      videoUrl: episodeData.videoUrl || '',
      backupUrl: episodeData.backupUrl || '',
      mirrorUrl: episodeData.mirrorUrl || '',
      duration: episodeData.duration || '24:00'
    };

    const updatedAnime = { ...anime, episodes: [...anime.episodes, newEp] };
    await saveAnime(updatedAnime);
    await refreshData();
    setEpisodeData({ 
      ...episodeData, 
      number: (newEp.number || 0) + 1, 
      title: '', 
      videoUrl: '', 
      backupUrl: '',
      mirrorUrl: '',
      thumbnail: '',
      duration: '24:00'
    });
    setLoading(false);
    alert('Episode Added!');
  };

  const handleUpdateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    const anime = animeList.find(a => a.id === selectedAnimeId);
    if (!anime) return;
    setLoading(true);

    const updatedEpisodes = anime.episodes.map(ep => 
      ep.id === selectedEpisodeId ? { ...ep, ...episodeData } as Episode : ep
    );

    await saveAnime({ ...anime, episodes: updatedEpisodes });
    await refreshData();
    setLoading(false);
    alert('Episode Updated');
    setSelectedEpisodeId('');
  };

  const handleEditSelect = (id: string) => {
    setSelectedAnimeId(id);
    const anime = animeList.find(a => a.id === id);
    if (anime) {
      setFormData({ ...anime });
      setGenreInput(anime.genres.join(', '));
    } else {
      setFormData(emptyAnime);
      setGenreInput('');
    }
  };

  const toggleLayoutFlag = async (anime: Anime, flag: 'trending' | 'isFanFavorite' | 'isHindiDub') => {
    // Optimistic UI update
    const updated = { ...anime, [flag]: !anime[flag] };
    await saveAnime(updated);
    refreshData();
  };

  const handleDeleteRequest = async (id: string) => {
    if(window.confirm('Delete this request?')) {
      await deleteRequest(id);
      loadRequests();
    }
  };

  const handleImportDB = async () => {
    if (!jsonInput.trim()) return;
    if (window.confirm("This will overwrite existing items with same IDs. Continue?")) {
      try {
        setLoading(true);
        await importDatabase(jsonInput);
        await refreshData();
        setJsonInput('');
        setLoading(false);
        alert("Database Imported Successfully!");
      } catch (e) {
        setLoading(false);
        alert("Invalid JSON data provided.");
      }
    }
  };

  const handleResetDB = async () => {
    if (window.confirm("This will upload the default MOCK data to Firestore. Use this only if your database is empty. Continue?")) {
      setLoading(true);
      await resetDatabase();
      await refreshData();
      setLoading(false);
      alert("Mock Data Uploaded to Cloud Successfully!");
    }
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4 ${
        activeTab === id 
          ? 'border-brand-500 text-brand-500 bg-brand-900/10' 
          : 'border-transparent text-gray-400 hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-900">
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0">
        <div className="py-4">
          <SidebarItem id="kitsu" label="Kitsu API" icon={DownloadCloud} />
          <SidebarItem id="home_layout" label="Home Layout" icon={Layout} />
          <SidebarItem id="requests" label="Requests" icon={MessageSquare} />
          <SidebarItem id="add_series" label="Add Series" icon={PlusSquare} />
          <SidebarItem id="edit_series" label="Edit Series" icon={Settings} />
          <SidebarItem id="add_episode" label="Add Episode" icon={PlusCircle} />
          <SidebarItem id="edit_episode" label="Edit Episode" icon={Edit3} />
          <SidebarItem id="maintenance" label="Database" icon={Database} />
          <div className="mt-8 border-t border-slate-800 pt-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500 hover:bg-red-900/10 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-black/20">
        <header className="bg-slate-900 h-16 border-b border-slate-800 flex items-center px-8 justify-between gap-4">
           <div className="flex items-center gap-3 text-slate-400 w-full max-w-md">
              <Search size={20} />
              <input 
                placeholder="Search series list..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-4">
             {loading && <div className="text-brand-500 font-bold text-sm animate-pulse flex items-center gap-2"><CloudLightning size={14}/> Syncing...</div>}
           </div>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto flex-1 text-gray-100">
          
          {/* --- REQUESTS TAB --- */}
          {activeTab === 'requests' && (
             <div className="max-w-4xl mx-auto animate-fadeIn">
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><MessageSquare /> User Requests</h2>
               <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                 {requests.length === 0 ? (
                   <div className="p-8 text-center text-gray-500">No requests yet.</div>
                 ) : (
                   <table className="w-full text-left">
                     <thead className="bg-slate-800 text-xs uppercase text-gray-400">
                       <tr>
                         <th className="p-4">Anime Name</th>
                         <th className="p-4">Notes</th>
                         <th className="p-4">Requested By</th>
                         <th className="p-4 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                       {requests.map(req => (
                         <tr key={req.id} className="hover:bg-slate-800/50">
                            <td className="p-4 font-bold text-white">{req.animeName}</td>
                            <td className="p-4 text-gray-400 text-sm max-w-xs">{req.additionalInfo || '-'}</td>
                            <td className="p-4 text-sm">
                               <div className="font-medium text-gray-300">{req.userName || 'Anonymous'}</div>
                               <div className="text-xs text-gray-600">{new Date(req.requestedAt).toLocaleDateString()}</div>
                            </td>
                            <td className="p-4 text-right">
                              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteRequest(req.id)}>
                                <Trash2 size={16}/>
                              </Button>
                            </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 )}
               </div>
             </div>
          )}

          {/* --- HOME LAYOUT TAB --- */}
          {activeTab === 'home_layout' && (
             <div className="animate-fadeIn">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">Curate Home Page</h2>
                 <input 
                    placeholder="Search anime..." 
                    className="p-2 rounded bg-slate-800 border border-slate-700 text-sm"
                    value={layoutSearch}
                    onChange={(e) => setLayoutSearch(e.target.value)}
                 />
               </div>
               
               <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-800 text-xs uppercase text-gray-400">
                       <tr>
                         <th className="p-4">Anime Title</th>
                         <th className="p-4 text-center">Trending</th>
                         <th className="p-4 text-center">Fan Favorite</th>
                         <th className="p-4 text-center">Hindi Dubbed</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                       {animeList.filter(a => a.title.toLowerCase().includes(layoutSearch.toLowerCase())).map(anime => (
                         <tr key={anime.id} className="hover:bg-slate-800/50">
                           <td className="p-4 flex items-center gap-3">
                             <img src={anime.thumbnail} className="w-10 h-14 object-cover rounded" />
                             <span className="font-bold text-gray-200">{anime.title}</span>
                           </td>
                           <td className="p-4 text-center">
                              <input type="checkbox" checked={anime.trending} onChange={() => toggleLayoutFlag(anime, 'trending')} className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500 focus:ring-brand-500"/>
                           </td>
                           <td className="p-4 text-center">
                              <input type="checkbox" checked={anime.isFanFavorite} onChange={() => toggleLayoutFlag(anime, 'isFanFavorite')} className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500 focus:ring-brand-500"/>
                           </td>
                           <td className="p-4 text-center">
                              <input type="checkbox" checked={anime.isHindiDub} onChange={() => toggleLayoutFlag(anime, 'isHindiDub')} className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500 focus:ring-brand-500"/>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
               <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-brand-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Database Management</h2>
                  </div>
                  
                  <div className={`p-4 rounded-lg text-sm mb-8 border ${isFirebaseInitialized ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-amber-900/20 text-amber-300 border-amber-500/30'}`}>
                    <p className="flex flex-col gap-1">
                      <strong className="flex items-center gap-2">
                        {isFirebaseInitialized ? <Wifi size={16}/> : <WifiOff size={16}/>}
                        Current Mode: {isFirebaseInitialized ? 'Live Cloud Database (Firestore)' : 'Local Browser Storage (Demo Mode)'}
                      </strong>
                      <span className="opacity-80">
                      {isFirebaseInitialized 
                        ? "You are connected to Google Firebase. Changes you make here are live for all users instantly."
                        : "You are currently in Offline Demo Mode. Changes are saved only to your browser's local storage. To go live, configure your API keys in services/firebase.ts."}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h3 className="font-bold text-white">Initialize Database</h3>
                        <p className="text-xs text-gray-400">If your database is empty, click this to upload the initial Mock Data.</p>
                        <Button onClick={handleResetDB} disabled={loading} variant="primary" className="w-full gap-2">
                          <CloudLightning size={18} /> {loading ? 'Uploading...' : 'Seed Default Data'}
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800">
                  <h3 className="font-bold text-white mb-4">Bulk JSON Import</h3>
                  <textarea 
                    className="w-full h-32 p-4 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs mb-4"
                    placeholder='Paste JSON array here...'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  <Button onClick={handleImportDB} disabled={loading} className="w-full">
                    Import Data
                  </Button>
               </div>
            </div>
          )}

          {activeTab === 'kitsu' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800">
                <h2 className="text-xl font-bold mb-4 text-white">Import from Kitsu</h2>
                <form onSubmit={handleKitsuSearch} className="flex gap-4">
                  <input className="flex-1 p-3 rounded-lg border border-slate-700 bg-slate-800 text-white" placeholder="Enter anime title..." value={kitsuQuery} onChange={(e) => setKitsuQuery(e.target.value)} />
                  <Button type="submit" disabled={loading} className="gap-2"><Search size={18}/> Search</Button>
                </form>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {kitsuResults.map((item: any) => (
                  <div key={item.id} className="flex gap-4 bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800">
                     <img src={item.attributes.posterImage?.small} className="w-24 h-36 object-cover rounded-md" />
                     <div className="flex-1">
                       <h3 className="font-bold text-lg text-white">{item.attributes.canonicalTitle}</h3>
                       <Button size="sm" onClick={() => handleImportKitsu(item)} disabled={importing === item.id} variant="outline" className="gap-2 mt-4">
                         {importing === item.id ? 'Importing...' : <><DownloadCloud size={16}/> Import</>}
                       </Button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'add_series' || activeTab === 'edit_series') && (
            <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold mb-6 text-white">{activeTab === 'add_series' ? 'Add New Series' : 'Edit Series'}</h2>
               {activeTab === 'edit_series' && (
                 <div className="mb-8">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Select Series</label>
                    <select className="w-full p-3 rounded-lg border bg-slate-800 border-slate-700 text-white" value={selectedAnimeId} onChange={e => handleEditSelect(e.target.value)}>
                      <option value="">-- Choose --</option>
                      {animeList.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                 </div>
               )}
               {(activeTab === 'add_series' || (activeTab === 'edit_series' && selectedAnimeId)) && (
                 <form onSubmit={handleSaveSeries} className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium mb-1 text-gray-300">Title</label>
                         <input required className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Anime Title" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
                           <select className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option></select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1 text-gray-300">Rating (0.0 - 10.0)</label>
                           <input type="number" step="0.1" min="0" max="10" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} placeholder="9.5" />
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Genres (Comma separated)</label>
                        <input 
                           className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" 
                           value={genreInput} 
                           onChange={e => setGenreInput(e.target.value)} 
                           placeholder="Action, Adventure, Fantasy" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {toggleFields.map(field => (
                        <button 
                          key={field.key} 
                          type="button" 
                          onClick={() => setFormData(p => ({ ...p, [field.key]: !p[field.key as keyof Anime] }))} 
                          className={`h-12 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                            formData[field.key as keyof Anime] 
                            ? (('highlight' in field && field.highlight) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-brand-500 text-white border-brand-500') 
                            : 'text-gray-400 border-slate-700 bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {field.key === 'isTrendingNo1' && <Flame size={14} fill={formData[field.key as keyof Anime] ? 'currentColor' : 'none'} />}
                          {field.label}
                        </button>
                      ))}
                    </div>

                    <div>
                       <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                       <textarea className="w-full p-2.5 rounded-lg border bg-slate-800 h-32 text-white border-slate-700" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Synopsis..." />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex gap-4 items-start">
                         <div className="flex-1">
                            <label className="block text-sm font-medium mb-1 text-gray-300">Thumbnail URL (Vertical)</label>
                            <input className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." />
                         </div>
                         <div className="w-24 h-36 bg-slate-800 rounded border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 mt-6">
                            {formData.thumbnail ? <img src={formData.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300"/>}
                         </div>
                      </div>

                      <div className="flex gap-4 items-start">
                         <div className="flex-1">
                            <label className="block text-sm font-medium mb-1 text-gray-300">Cover Image URL (Horizontal)</label>
                            <input className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="https://..." />
                         </div>
                         <div className="w-48 h-24 bg-slate-800 rounded border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 mt-6">
                            {formData.coverImage ? <img src={formData.coverImage} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300"/>}
                         </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between">
                      {activeTab === 'edit_series' && <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-900/10" onClick={async () => { if (window.confirm("Delete series?")) { setLoading(true); await deleteAnime(formData.id); await refreshData(); setSelectedAnimeId(''); setFormData(emptyAnime); setLoading(false); } }}>Delete Series</Button>}
                      <Button type="submit" disabled={loading} className="gap-2 ml-auto"><Save size={18} /> {loading ? 'Saving...' : 'Save Series'}</Button>
                    </div>
                 </form>
               )}
            </div>
          )}

          {(activeTab === 'add_episode' || activeTab === 'edit_episode') && (
            <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800 max-w-5xl mx-auto">
               <h2 className="text-2xl font-bold mb-6 text-white">{activeTab === 'add_episode' ? 'Add Episode' : 'Manage Episodes'}</h2>
               
               <div className="mb-8">
                 <label className="block text-sm font-medium mb-1 text-gray-300">Select Anime Series</label>
                 <select className="w-full p-3 rounded-lg border bg-slate-800 text-white border-slate-700" value={selectedAnimeId} onChange={e => { setSelectedAnimeId(e.target.value); setSelectedEpisodeId(''); }}>
                    <option value="">-- Choose Series --</option>
                    {animeList.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                 </select>
               </div>

               {selectedAnimeId && activeTab === 'add_episode' && (
                  <form onSubmit={handleAddEpisode} className="space-y-6 animate-fadeIn">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Season</label>
                          <input type="number" required min="1" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.seasonNumber} onChange={e => setEpisodeData({...episodeData, seasonNumber: parseInt(e.target.value)})} placeholder="1" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Episode #</label>
                          <input type="number" required min="1" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.number} onChange={e => setEpisodeData({...episodeData, number: parseInt(e.target.value)})} placeholder="1" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Duration</label>
                          <input type="text" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.duration} onChange={e => setEpisodeData({...episodeData, duration: e.target.value})} placeholder="24:00" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Episode Title</label>
                          <input type="text" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} placeholder="Enter title..." />
                        </div>
                     </div>

                     <div className="space-y-4 border-t border-slate-800 pt-4">
                       <h3 className="font-bold flex items-center gap-2 text-white"><MonitorPlay size={18} /> Video Sources & Previews</h3>
                       
                       <div className="grid grid-cols-1 gap-6">
                          {['videoUrl', 'backupUrl', 'mirrorUrl'].map((key) => {
                             const url = episodeData[key as keyof Episode] as string;
                             const label = key === 'videoUrl' ? 'Main Server' : key === 'backupUrl' ? 'Backup Server' : 'Mirror Server';
                             
                             return (
                               <div key={key} className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-slate-800">
                                  <div>
                                     <label className={`block text-sm font-medium mb-1 ${key === 'videoUrl' ? 'text-brand-500' : 'text-gray-300'}`}>{label}</label>
                                     <input type="url" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={url || ''} onChange={e => setEpisodeData({...episodeData, [key]: e.target.value})} placeholder="https://..." />
                                  </div>
                                  <div className="bg-black rounded overflow-hidden aspect-video border border-slate-700 flex items-center justify-center">
                                     {url ? (
                                        <iframe src={url} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                                     ) : (
                                        <div className="text-gray-500 text-xs">No Preview</div>
                                     )}
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                     </div>

                     <div className="space-y-4 border-t border-slate-800 pt-4">
                        <div className="flex gap-4 items-end">
                           <div className="flex-1">
                              <label className="block text-sm font-medium mb-1 text-gray-300">Episode Thumbnail URL</label>
                              <input className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.thumbnail} onChange={e => setEpisodeData({...episodeData, thumbnail: e.target.value})} placeholder="Leave empty to use series thumbnail" />
                           </div>
                           <div className="w-32 h-18 bg-slate-800 rounded border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {episodeData.thumbnail ? <img src={episodeData.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300"/>}
                           </div>
                        </div>
                     </div>

                     <Button type="submit" disabled={loading} className="w-full gap-2 py-3"><PlusCircle size={18} /> {loading ? 'Adding...' : 'Add Episode'}</Button>
                  </form>
               )}

               {selectedAnimeId && activeTab === 'edit_episode' && (
                 <div className="space-y-6">
                    <div className="border rounded-lg border-slate-700 overflow-hidden bg-slate-900">
                       <div className="max-h-60 overflow-y-auto">
                           <table className="w-full text-left">
                              <thead className="bg-slate-800 text-xs uppercase text-gray-500 sticky top-0">
                                <tr>
                                  <th className="p-3">Ep</th>
                                  <th className="p-3">Title</th>
                                  <th className="p-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                 {animeList.find(a => a.id === selectedAnimeId)?.episodes.sort((a,b) => a.seasonNumber === b.seasonNumber ? a.number - b.number : a.seasonNumber - b.seasonNumber).map(ep => (
                                    <tr key={ep.id} className="hover:bg-slate-800/50">
                                       <td className="p-3 font-bold text-brand-500 w-20">S{ep.seasonNumber} E{ep.number}</td>
                                       <td className="p-3 text-white truncate max-w-[200px]">{ep.title}</td>
                                       <td className="p-3 text-right">
                                          <Button size="sm" variant="ghost" onClick={() => { setSelectedEpisodeId(ep.id); setEpisodeData(ep); }}><Edit3 size={16}/></Button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                       </div>
                    </div>
                    
                    {selectedEpisodeId && (
                       <form onSubmit={handleUpdateEpisode} className="p-6 bg-brand-900/10 rounded-xl space-y-4 animate-fadeIn border border-brand-900/30">
                          <h3 className="font-bold text-lg text-white mb-4">Editing Episode</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <label className="text-xs uppercase font-bold text-gray-500">Title</label>
                               <input type="text" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} />
                             </div>
                             <div>
                               <label className="text-xs uppercase font-bold text-gray-500">Thumbnail</label>
                               <input type="text" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.thumbnail} onChange={e => setEpisodeData({...episodeData, thumbnail: e.target.value})} />
                             </div>
                             <div>
                               <label className="text-xs uppercase font-bold text-gray-500">Duration</label>
                               <input type="text" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.duration} onChange={e => setEpisodeData({...episodeData, duration: e.target.value})} />
                             </div>
                          </div>

                          <div className="space-y-4 pt-2">
                             <label className="text-xs uppercase font-bold text-gray-500">Video Sources</label>
                             <div className="grid grid-cols-1 gap-4">
                                {['videoUrl', 'backupUrl', 'mirrorUrl'].map((key) => (
                                  <div key={key} className="flex gap-4 items-center">
                                    <input 
                                      type="url" 
                                      placeholder={key === 'videoUrl' ? 'Main URL' : key} 
                                      className="flex-1 p-2 rounded border bg-slate-800 text-white border-slate-700" 
                                      value={episodeData[key as keyof Episode] as string || ''} 
                                      onChange={e => setEpisodeData({...episodeData, [key]: e.target.value})} 
                                    />
                                    {/* Small Preview Button/Icon could go here, currently inline preview below */}
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4 border-t border-brand-800/30">
                             <Button type="button" variant="ghost" onClick={() => setSelectedEpisodeId('')}>Cancel</Button>
                             <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</Button>
                          </div>
                       </form>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};