import React from 'react';
import { keycloak } from '../keycloak';

const Login: React.FC = () => {
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
        
        <div className="p-8 text-center">
          <button
            type="button"
            onClick={() => keycloak.login()}
            className="w-full py-4 bg-magenta hover:bg-magenta-h text-white rounded-xl text-[15px] font-bold shadow-lg shadow-magenta/20 transition-all hover:-translate-y-0.5"
          >
            Se connecter avec Keycloak →
          </button>
          
          <div className="mt-8 pt-6 border-t border-border">
            <span className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-3">Comptes de test</span>
            <div className="text-[12px] text-text-2 mb-4 bg-light/50 p-3 rounded-lg text-left">
              <p className="mb-2"><strong>Admin :</strong> admin@paramiq.local / admin123</p>
              <p><strong>Analyste :</strong> analyst@paramiq.local / analyst123</p>
            </div>
            
            <button type="button" onClick={() => window.location.href = '/'} className="text-[12px] text-text-3 hover:text-deepBlue font-medium">← Retour à l'accueil</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
