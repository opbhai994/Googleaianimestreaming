import React, { useState, useEffect } from 'react';
import { User, Anime, Episode } from '../types';
import { saveAnime, deleteAnime, resetDatabase, importDatabase, STORAGE_KEY } from '../services/data';
import { searchKitsuAnime, mapKitsuToAnime } from '../services/kitsu';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { 
  DownloadCloud, 
  Upload, 
  PlusSquare, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  LogOut, 
  Search,
  Save,
  Check,
  Film,
  X,
  Languages,
  Star,
  TrendingUp,
  Heart,
  Settings,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  Database,
  Copy,
  RotateCcw,
  ExternalLink
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
  isHindiDub: false
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
  const [genreInput, setGenreInput] = useState('');

  // Maintenance States
  const [jsonInput, setJsonInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!user || !user.isAdmin) return <Navigate to="/" />;

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
    await saveAnime({ ...formData, id });
    await refreshData();
    setFormData(emptyAnime);
    setSelectedAnimeId('');
    setLoading(false);
    alert(activeTab === 'edit_series' ? 'Series Updated!' : 'Series Saved!');
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
      thumbnail: '' 
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
    } else {
      setFormData(emptyAnime);
    }
  };

  const handleExportDB = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      navigator.clipboard.writeText(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      alert("Database JSON copied to clipboard! Paste this into services/data.ts under MOCK_ANIMES to make changes permanent for everyone.");
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

  const SidebarItem = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (id === 'add_series') {
          setFormData(emptyAnime);
          setSelectedAnimeId('');
        }
      }}
      className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4 ${
        activeTab === id 
          ? 'border-brand-500 text-brand-500 bg-brand-50 dark:bg-brand-900/10' 
          : 'border-transparent text-slate-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-slate-900">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex-shrink-0">
        <div className="py-4">
          <SidebarItem id="kitsu" label="Kitsu API" icon={DownloadCloud} />
          <SidebarItem id="add_series" label="Add Series" icon={PlusSquare} />
          <SidebarItem id="edit_series" label="Edit Series" icon={Settings} />
          <SidebarItem id="add_episode" label="Add Episode" icon={PlusCircle} />
          <SidebarItem id="edit_episode" label="Edit Episode" icon={Edit3} />
          <SidebarItem id="maintenance" label="Maintenance" icon={Database} />
          <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-black/20">
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-gray-200 dark:border-slate-800 flex items-center px-8 justify-between">
           <div className="flex items-center gap-3 text-slate-400 w-full max-w-md">
              <Search size={20} />
              <input 
                placeholder="Search series list..." 
                className="bg-transparent border-none outline-none text-sm w-full dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           {loading && <Loader2 className="animate-spin text-brand-500" size={24} />}
        </header>

        <div className="p-4 md:p-8 overflow-y-auto flex-1">
          {activeTab === 'maintenance' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
               <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-brand-500" size={24} />
                    <h2 className="text-2xl font-bold dark:text-white">Global Sync & Backup</h2>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm mb-8 flex gap-3">
                    <ExternalLink className="flex-shrink-0" size={20} />
                    <p>
                      <strong>EdgeOne Hosting Tip:</strong> To make your changes visible for <b>all users</b>, click "Export Database", copy the code, and paste it into <code>services/data.ts</code> under <code>MOCK_ANIMES</code>. Then redeploy your site.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h3 className="font-bold dark:text-white">Export Current Data</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Copy your current local changes as a JSON object for sharing or permanent deployment.</p>
                        <Button onClick={handleExportDB} variant="outline" className="w-full gap-2">
                          <Copy size={18} /> {copySuccess ? 'Copied!' : 'Export Database'}
                        </Button>
                     </div>

                     <div className="space-y-4">
                        <h3 className="font-bold dark:text-white">Restore Factory Defaults</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Discard all local changes and reset the browser storage to match the code's default values.</p>
                        <Button onClick={handleResetDB} variant="ghost" className="w-full gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                          <RotateCcw size={18} /> Reset All Local Data
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                  <h3 className="font-bold dark:text-white mb-4">Manual Import</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Paste a JSON database string here to update your current browser view.</p>
                  <textarea 
                    className="w-full h-32 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 dark:text-white font-mono text-xs mb-4"
                    placeholder='Paste JSON array here... e.g. [{"id": "1", ...}]'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  <Button onClick={handleImportDB} className="w-full" disabled={!jsonInput.trim()}>
                    Import Data from JSON
                  </Button>
               </div>
            </div>
          )}

          {activeTab === 'kitsu' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Import from Kitsu</h2>
                <form onSubmit={handleKitsuSearch} className="flex gap-4">
                  <input className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white" placeholder="Enter anime title..." value={kitsuQuery} onChange={(e) => setKitsuQuery(e.target.value)} />
                  <Button type="submit" disabled={loading} className="gap-2"><Search size={18}/> Search</Button>
                </form>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {kitsuResults.map((item: any) => (
                  <div key={item.id} className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                     <img src={item.attributes.posterImage?.small} className="w-24 h-36 object-cover rounded-md" />
                     <div className="flex-1">
                       <h3 className="font-bold text-lg dark:text-white">{item.attributes.canonicalTitle}</h3>
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
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold mb-6 dark:text-white">{activeTab === 'add_series' ? 'Add New Series' : 'Edit Series'}</h2>
               {activeTab === 'edit_series' && (
                 <div className="mb-8">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Series</label>
                    <select className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={selectedAnimeId} onChange={e => handleEditSelect(e.target.value)}>
                      <option value="">-- Choose --</option>
                      {animeList.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                 </div>
               )}
               {(activeTab === 'add_series' || (activeTab === 'edit_series' && selectedAnimeId)) && (
                 <form onSubmit={handleSaveSeries} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input required className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" />
                      <div className="grid grid-cols-2 gap-4">
                        <select className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option></select>
                        <input type="number" step="0.1" className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} placeholder="Rating" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {['isHindiDub', 'featured', 'trending', 'isFanFavorite'].map(key => (
                        <button key={key} type="button" onClick={() => setFormData(p => ({ ...p, [key]: !p[key as keyof Anime] }))} className={`h-10 rounded-lg text-xs font-bold border ${formData[key as keyof Anime] ? 'bg-brand-500 text-white' : 'text-gray-400'}`}>
                          {key.replace('is', '').toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <textarea className="w-full p-2.5 rounded-lg border dark:bg-slate-800 h-32 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="Thumbnail URL" />
                      <input className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="Cover URL" />
                    </div>
                    <div className="pt-4 border-t flex justify-between">
                      {activeTab === 'edit_series' && <Button type="button" variant="ghost" className="text-red-500" onClick={async () => { if (window.confirm("Delete?")) { setLoading(true); await deleteAnime(formData.id); await refreshData(); setSelectedAnimeId(''); setFormData(emptyAnime); setLoading(false); } }}>Delete</Button>}
                      <Button type="submit" disabled={loading} className="gap-2 ml-auto"><Save size={18} /> {loading ? 'Saving...' : 'Save'}</Button>
                    </div>
                 </form>
               )}
            </div>
          )}

          {(activeTab === 'add_episode' || activeTab === 'edit_episode') && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold mb-6 dark:text-white">{activeTab === 'add_episode' ? 'Add Episode' : 'Manage Episodes'}</h2>
               <select className="w-full p-3 mb-6 rounded-lg border dark:bg-slate-800 dark:text-white" value={selectedAnimeId} onChange={e => { setSelectedAnimeId(e.target.value); setSelectedEpisodeId(''); }}>
                  <option value="">-- Choose Series --</option>
                  {animeList.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
               </select>

               {selectedAnimeId && activeTab === 'add_episode' && (
                  <form onSubmit={handleAddEpisode} className="space-y-6 animate-fadeIn">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <input type="number" required min="1" className="p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={episodeData.seasonNumber} onChange={e => setEpisodeData({...episodeData, seasonNumber: parseInt(e.target.value)})} placeholder="Season" />
                        <input type="number" required min="1" className="p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={episodeData.number} onChange={e => setEpisodeData({...episodeData, number: parseInt(e.target.value)})} placeholder="Ep #" />
                        <input type="text" className="md:col-span-2 p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} placeholder="Ep Title" />
                     </div>
                     <input type="url" required className="w-full p-2 rounded border dark:bg-slate-800 dark:text-white" value={episodeData.videoUrl} onChange={e => setEpisodeData({...episodeData, videoUrl: e.target.value})} placeholder="Main Video URL" />
                     <Button type="submit" disabled={loading} className="w-full gap-2"><PlusCircle size={18} /> {loading ? 'Adding...' : 'Add Episode'}</Button>
                  </form>
               )}

               {selectedAnimeId && activeTab === 'edit_episode' && (
                 <div className="space-y-6">
                    <div className="border rounded-lg dark:border-slate-700 overflow-hidden">
                       <table className="w-full text-left">
                          <tbody className="divide-y dark:divide-slate-800">
                             {animeList.find(a => a.id === selectedAnimeId)?.episodes.sort((a,b) => a.seasonNumber === b.seasonNumber ? a.number - b.number : a.seasonNumber - b.seasonNumber).map(ep => (
                                <tr key={ep.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                   <td className="p-3 font-bold text-brand-500">S{ep.seasonNumber} E{ep.number}</td>
                                   <td className="p-3 dark:text-white truncate max-w-[200px]">{ep.title}</td>
                                   <td className="p-3 text-right">
                                      <Button size="sm" variant="ghost" onClick={() => { setSelectedEpisodeId(ep.id); setEpisodeData(ep); }}><Edit3 size={16}/></Button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    {selectedEpisodeId && (
                       <form onSubmit={handleUpdateEpisode} className="p-6 bg-brand-50 dark:bg-brand-900/10 rounded-xl space-y-4">
                          <input type="text" className="w-full p-2 rounded border dark:bg-slate-800 dark:text-white" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} />
                          <input type="url" className="w-full p-2 rounded border dark:bg-slate-800 dark:text-white" value={episodeData.videoUrl} onChange={e => setEpisodeData({...episodeData, videoUrl: e.target.value})} />
                          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setSelectedEpisodeId('')}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</Button></div>
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