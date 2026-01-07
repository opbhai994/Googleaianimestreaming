import React, { useState, useEffect } from 'react';
import { User, Anime, Episode } from '../types';
import { saveAnime, deleteAnime, resetDatabase, importDatabase, STORAGE_KEY } from '../services/data';
import { searchKitsuAnime, mapKitsuToAnime } from '../services/kitsu';
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
  Copy,
  RotateCcw,
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  MonitorPlay,
  Flame,
  FileCode
} from 'lucide-react';

interface AdminProps {
  user: User | null;
  animeList: Anime[];
  refreshData: () => void;
}

type Tab = 'kitsu' | 'upload' | 'add_series' | 'edit_series' | 'add_episode' | 'edit_episode' | 'maintenance';

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

// Helper to generate the full content of data.ts
const generateDataTsContent = (animes: Anime[]) => {
  const json = JSON.stringify(animes, null, 2);
  return `import { Anime } from '../types';

export const STORAGE_KEY = 'anime_india_data';

export const MOCK_ANIMES: Anime[] = ${json};

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
};`;
};

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
    thumbnail: '' 
  });
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');

  // Maintenance States
  const [jsonInput, setJsonInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

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
      duration: '24:00'
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
      thumbnail: '' // Reset thumbnail so it picks up default next time if needed
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

  const handleExportDB = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      navigator.clipboard.writeText(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      alert("Database JSON copied to clipboard!");
    }
  };

  const handleImportDB = async () => {
    if (!jsonInput.trim()) return;
    if (window.confirm("This will overwrite your current local data. Continue?")) {
      try {
        await importDatabase(jsonInput);
        await refreshData();
        setJsonInput('');
        alert("Database Imported Successfully!");
      } catch (e) {
        alert("Invalid JSON data provided.");
      }
    }
  };

  const handleResetDB = async () => {
    if (window.confirm("Reset everything to default state? This cannot be undone.")) {
      await resetDatabase();
      await refreshData();
      alert("Database Reset Successfully!");
    }
  };

  const handleCopyDataTs = () => {
    const code = generateDataTsContent(animeList);
    navigator.clipboard.writeText(code);
    alert("Full services/data.ts code copied to clipboard!");
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
          <SidebarItem id="add_series" label="Add Series" icon={PlusSquare} />
          <SidebarItem id="edit_series" label="Edit Series" icon={Settings} />
          <SidebarItem id="add_episode" label="Add Episode" icon={PlusCircle} />
          <SidebarItem id="edit_episode" label="Edit Episode" icon={Edit3} />
          <SidebarItem id="maintenance" label="Maintenance" icon={Database} />
          <div className="mt-8 border-t border-slate-800 pt-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500 hover:bg-red-900/10 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-black/20">
        <header className="bg-slate-900 h-16 border-b border-slate-800 flex items-center px-8 justify-between">
           <div className="flex items-center gap-3 text-slate-400 w-full max-w-md">
              <Search size={20} />
              <input 
                placeholder="Search series list..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           {loading && <div className="text-brand-500 font-bold text-sm animate-pulse">Processing...</div>}
        </header>

        <div className="p-4 md:p-8 overflow-y-auto flex-1 text-gray-100">
          {activeTab === 'maintenance' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
               <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-brand-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Global Sync & Backup</h2>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 text-blue-300 rounded-lg text-sm mb-8 flex gap-3">
                    <ExternalLink className="flex-shrink-0" size={20} />
                    <p>
                      <strong>Hosting Tip:</strong> Click "Copy File Content" below and replace the entire content of <code>services/data.ts</code> in your project before deploying.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h3 className="font-bold text-white">Export Current Data (JSON)</h3>
                        <Button onClick={handleExportDB} variant="outline" className="w-full gap-2">
                          <Copy size={18} /> {copySuccess ? 'Copied!' : 'Copy JSON'}
                        </Button>
                     </div>

                     <div className="space-y-4">
                        <h3 className="font-bold text-white">Restore Factory Defaults</h3>
                        <Button onClick={handleResetDB} variant="ghost" className="w-full gap-2 text-red-500 hover:bg-red-900/10">
                          <RotateCcw size={18} /> Reset All Local Data
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800">
                  <h3 className="font-bold text-white mb-4">Manual Import</h3>
                  <textarea 
                    className="w-full h-32 p-4 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs mb-4"
                    placeholder='Paste JSON array here...'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  <Button onClick={handleImportDB} className="w-full" disabled={!jsonInput.trim()}>
                    Import Data from JSON
                  </Button>
               </div>

               {/* New Section: Data.ts Source Code */}
               <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                        <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          <FileCode className="text-green-500" size={24} /> 
                          services/data.ts Source Code
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Copy this entire code block and replace the content of <code className="text-brand-500 font-mono">services/data.ts</code> to make your changes permanent for hosting.
                        </p>
                     </div>
                     <Button onClick={handleCopyDataTs} variant="primary" className="gap-2 bg-green-600 hover:bg-green-700">
                        <Copy size={18} /> Copy File Content
                     </Button>
                  </div>
                  
                  <div className="relative">
                     <textarea 
                        readOnly
                        className="w-full h-96 p-4 rounded-lg bg-slate-950 border border-slate-700 text-green-400 font-mono text-xs focus:ring-2 focus:ring-green-900 outline-none"
                        value={generateDataTsContent(animeList)}
                        onClick={(e) => e.currentTarget.select()}
                     />
                  </div>
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
                           <label className="block text-sm font-medium mb-1 text-gray-300">Rating (0-5)</label>
                           <input type="number" step="0.1" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} placeholder="4.5" />
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
                        <div className="col-span-2">
                          <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Episode Title</label>
                          <input type="text" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} placeholder="Enter title..." />
                        </div>
                     </div>

                     <div className="space-y-4 border-t border-slate-800 pt-4">
                       <h3 className="font-bold flex items-center gap-2 text-white"><MonitorPlay size={18} /> Video Sources</h3>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Separated Main, Backup, and Mirror URL Section */}
                          <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-slate-800">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-brand-500">Main Video URL (Required)</label>
                                <input type="url" required className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700 focus:border-brand-500" value={episodeData.videoUrl} onChange={e => setEpisodeData({...episodeData, videoUrl: e.target.value})} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Backup URL (Optional)</label>
                                <input type="url" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.backupUrl} onChange={e => setEpisodeData({...episodeData, backupUrl: e.target.value})} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Mirror URL (Optional)</label>
                                <input type="url" className="w-full p-2.5 rounded-lg border bg-slate-800 text-white border-slate-700" value={episodeData.mirrorUrl} onChange={e => setEpisodeData({...episodeData, mirrorUrl: e.target.value})} placeholder="https://..." />
                            </div>
                          </div>

                          {/* Separate Iframe Player Preview */}
                          <div className="bg-black/40 rounded-lg p-4 flex flex-col items-center justify-center border border-dashed border-slate-700">
                             {episodeData.videoUrl ? (
                               <div className="w-full aspect-video bg-black rounded overflow-hidden shadow-lg">
                                 <iframe src={episodeData.videoUrl} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
                               </div>
                             ) : (
                               <div className="text-center text-gray-400">
                                 <MonitorPlay size={48} className="mx-auto mb-2 opacity-50"/>
                                 <p className="text-sm">Enter Main Video URL to preview player</p>
                               </div>
                             )}
                             <p className="text-xs text-gray-500 mt-2">Test your video link here before saving.</p>
                          </div>
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
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="text-xs uppercase font-bold text-gray-500">Title</label>
                               <input type="text" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} />
                             </div>
                             <div>
                               <label className="text-xs uppercase font-bold text-gray-500">Thumbnail</label>
                               <input type="text" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.thumbnail} onChange={e => setEpisodeData({...episodeData, thumbnail: e.target.value})} />
                             </div>
                          </div>

                          <div className="space-y-3 pt-2">
                             <label className="text-xs uppercase font-bold text-gray-500">Video Sources</label>
                             <input type="url" placeholder="Main URL" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.videoUrl} onChange={e => setEpisodeData({...episodeData, videoUrl: e.target.value})} />
                             <input type="url" placeholder="Backup URL" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.backupUrl} onChange={e => setEpisodeData({...episodeData, backupUrl: e.target.value})} />
                             <input type="url" placeholder="Mirror URL" className="w-full p-2 rounded border bg-slate-800 text-white border-slate-700" value={episodeData.mirrorUrl} onChange={e => setEpisodeData({...episodeData, mirrorUrl: e.target.value})} />
                          </div>

                          {/* Preview in Edit Mode */}
                          {episodeData.videoUrl && (
                             <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <div className="aspect-video w-48 bg-black rounded overflow-hidden">
                                   <iframe src={episodeData.videoUrl} className="w-full h-full" frameBorder="0"></iframe>
                                </div>
                             </div>
                          )}

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