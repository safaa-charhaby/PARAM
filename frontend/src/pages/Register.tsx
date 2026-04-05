import React, { useState } from 'react';

interface RegisterProps {
  onAuth: (role: string) => void;
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onAuth, onNavigate }) => {
  const [role, setRole] = useState('analyst');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      onAuth(role);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="bg-brand-dark p-6 text-center border-b border-white/10">
          <div className="relative w-[48px] h-[48px] mx-auto mb-4 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-brand-yellow rotate-45 rounded-sm"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-magenta rotate-45 rounded-sm"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-magenta rotate-45 rounded-sm"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-brand-cyan rotate-45 rounded-sm"></div>
            <div className="absolute w-3 h-3 bg-brand-blue rotate-45 rounded-xs z-10"></div>
          </div>
          <h1 className="text-xl font-heading font-extrabold text-white">Créez votre compte</h1>
          <p className="text-xs text-white/50 mt-1">Rejoignez ParamIQ SBS Platform</p>
        </div>
        
        <form onSubmit={handleRegister} className="p-6">
          <div className="flex bg-[#f1f5f9] p-1 rounded-lg mb-6">
            <button 
              type="button"
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ${role === 'admin' ? 'bg-white shadow-sm text-navy' : 'text-text-2 hover:text-navy'}`}
              onClick={() => setRole('admin')}
            >
              👑 Administrateur
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ${role === 'analyst' ? 'bg-white shadow-sm text-navy' : 'text-text-2 hover:text-navy'}`}
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
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-shadow"
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
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-shadow"
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
                className="w-full bg-[#f8fafc] border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-shadow"
                placeholder="Mûmum 8 caractères"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-navy hover:bg-[#1e293b] text-white rounded-xl text-[14px] font-bold shadow-xl transition-all hover:-translate-y-0.5 mb-4">
            Créer mon compte
          </button>

          <p className="text-center text-[13px] text-text-2">
            Déjà inscrit ? <button type="button" onClick={() => onNavigate('login')} className="text-navy font-bold hover:underline">Se connecter</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
