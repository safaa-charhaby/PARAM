import React, { useState } from 'react';

interface RegisterProps {
  onAuth: (payload: { token: string; user: { id: string; name: string; email: string; role: 'admin' | 'analyst' } }) => void;
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onAuth, onNavigate }) => {
  const [role, setRole] = useState('analyst');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || isSubmitting) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de créer le compte');
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
      const message = err instanceof Error ? err.message : 'Impossible de créer le compte';
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
          <h1 className="text-xl font-heading font-extrabold text-white">Créez votre compte</h1>
          <p className="text-xs text-white/50 mt-1">Rejoignez ParamIQ SBS Platform</p>
        </div>
        
        <form onSubmit={handleRegister} className="p-6">
          <div className="flex bg-[#f1f5f9] p-1 rounded-lg mb-6">
            <button 
              type="button"
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ${role === 'admin' ? 'bg-white shadow-sm text-deepBlue' : 'text-text-2 hover:text-deepBlue'}`}
              onClick={() => setRole('admin')}
            >
              👑 Administrateur
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ${role === 'analyst' ? 'bg-white shadow-sm text-deepBlue' : 'text-text-2 hover:text-deepBlue'}`}
              onClick={() => setRole('analyst')}
            >
              👤 Analyste
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-text-2 mb-1.5 uppercase tracking-wide">Nom complet</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-deepBlue outline-none focus:border-magenta focus:ring-1 focus:ring-magenta/30 transition-shadow"
                placeholder="Ahmed Benali"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
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
                placeholder="Mûmum 8 caractères"
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
            className="w-full py-3.5 bg-deepBlue hover:bg-[#1e293b] disabled:bg-deepBlue/60 text-white rounded-xl text-[14px] font-bold shadow-xl transition-all hover:-translate-y-0.5 mb-4 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isSubmitting ? 'Création...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-[13px] text-text-2">
            Déjà inscrit ? <button type="button" onClick={() => onNavigate('login')} className="text-deepBlue font-bold hover:underline">Se connecter</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
