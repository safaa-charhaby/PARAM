import React, { useState } from 'react';

interface LoginProps {
  onAuth: (payload: { token: string; user: { id: string; name: string; email: string; role: 'admin' | 'analyst' } }) => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onAuth, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de se connecter');
      }

      onAuth({
        token: data.token,
        user: {
          id: data.user?._id,
          name: data.user?.name,
          email: data.user?.email,
          role: data.user?.role,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de se connecter';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="bg-[#101b2d] p-6 text-center border-b border-light/10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-magenta text-white rounded-xl font-heading font-bold text-2xl mb-4 shadow-lg shadow-magenta/30">
            P
          </div>
          <h1 className="text-xl font-heading font-extrabold text-white">Content de vous revoir !</h1>
          <p className="text-xs text-white/50 mt-1">Connectez-vous à ParamIQ Platform</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-text-2 mb-1.5 uppercase tracking-wide">Adresse Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-deepBlue outline-none focus:border-magenta focus:ring-1 focus:ring-magenta/30 transition-shadow"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-2 mb-1.5 uppercase tracking-wide">Mot de passe</label>
              <input 
                type="password" 
                required
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-deepBlue outline-none focus:border-magenta focus:ring-1 focus:ring-magenta/30 transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-magenta hover:bg-magenta-h disabled:bg-magenta/60 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-magenta/20 transition-all hover:-translate-y-0.5 mb-4 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter →'}
          </button>

          <p className="text-center text-[13px] text-text-2">
            Pas encore de compte ? <button type="button" onClick={() => onNavigate('register')} className="text-magenta font-bold hover:underline">S'inscrire</button>
          </p>
          <div className="mt-8 text-center pt-6 border-t border-border">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-2">Comptes de test (Raccourcis)</span>
              <div className="flex gap-2 justify-center">
                <button 
                  type="button" 
                  onClick={() => { setEmail('admin@paramiq.local'); setPassword('Admin123!'); }}
                  className="px-3 py-1 bg-magenta/10 text-magenta rounded text-[11px] font-bold hover:bg-magenta hover:text-white transition-colors"
                >
                  Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('analyst@paramiq.local'); setPassword('Analyst123!'); }}
                  className="px-3 py-1 bg-blue/10 text-blue rounded text-[11px] font-bold hover:bg-blue hover:text-white transition-colors"
                >
                  Analyste
                </button>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate('home')} className="text-[12px] text-text-3 hover:text-deepBlue font-medium">← Retour à l'accueil public</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
