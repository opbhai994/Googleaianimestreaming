import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AnimeRequest } from '../types';
import { submitRequest } from '../services/data';
import { Button } from '../components/Button';
import { MessageSquare, Send } from 'lucide-react';

interface RequestAnimeProps {
  user: User | null;
}

export const RequestAnime: React.FC<RequestAnimeProps> = ({ user }) => {
  const [animeName, setAnimeName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animeName.trim()) return;

    setLoading(true);
    const request: AnimeRequest = {
      id: `req-${Date.now()}`,
      animeName,
      additionalInfo,
      status: 'Pending',
      requestedAt: Date.now(),
      userId: user?.id,
      userName: user?.name || user?.email || 'Guest'
    };

    try {
      await submitRequest(request);
      setSubmitted(true);
    } catch (e) {
      alert("Failed to submit request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-8">
        {submitted ? (
          <div className="text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Request Received!</h1>
            <p className="text-slate-500 dark:text-gray-400">
              Thanks for your suggestion. We'll try to add <strong>{animeName}</strong> as soon as possible.
            </p>
            <div className="pt-6">
              <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
               <div className="w-12 h-12 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MessageSquare size={24} />
               </div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Request Anime</h1>
               <p className="text-slate-500 dark:text-gray-400">Can't find what you're looking for? Let us know!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Anime Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  value={animeName}
                  onChange={(e) => setAnimeName(e.target.value)}
                  placeholder="e.g. Dragon Ball Z"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Additional Notes (Optional)</label>
                <textarea 
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-32 resize-none"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Specific season, movie, or dubbed version..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3 gap-2">
                {loading ? 'Submitting...' : <><Send size={18}/> Submit Request</>}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};