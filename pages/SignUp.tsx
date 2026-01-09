import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { registerUser } from '../services/data';
import { AlertTriangle } from 'lucide-react';

interface SignUpProps {
  onSignUp: (user: any) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }

    setLoading(true);

    try {
      const newUser = {
        name,
        email,
        password, // Warning: Storing for demo purposes. Use Firebase Auth in production.
        isAdmin: email === 'bk.9041442950@gmail.com',
        watchlist: [],
        watchHistory: []
      };
      
      const createdUser = await registerUser(newUser);
      onSignUp(createdUser);
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-brand-500 mb-2">Anime India</h1>
           <p className="text-slate-500 dark:text-gray-400">Create your account to start watching.</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
           <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
           <p className="text-xs text-yellow-200">
             <strong>IMPORTANT:</strong> Please don't forget your password and email. Since this is a demo environment, there is no password reset functionality available.
           </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Naruto Uzumaki"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. naruto@konoha.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full py-3">{loading ? 'Creating Account...' : 'Create Account'}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-500 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};