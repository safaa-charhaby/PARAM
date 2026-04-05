import React from 'react';
import type { UserRole } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, userRole, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-bg">
      {/* Top Navbar */}
      <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-3 font-heading font-bold text-[16px] text-navy cursor-pointer"
            onClick={() => setCurrentPage('dashboard')}
          >
            <div className="relative w-[32px] h-[32px] flex items-center justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-yellow rotate-45 rounded-sm"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-cyan rotate-45 rounded-sm"></div>
              <div className="absolute w-2 h-2 bg-brand-blue rotate-45 rounded-xs z-10"></div>
            </div>
            ParamIQ Platform
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              className={`text-[13px] font-bold ${currentPage === 'dashboard' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'validation' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('validation')}
            >
              Validation
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'comparateur' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('comparateur')}
            >
              Comparateur
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'anomalies' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('anomalies')}
            >
              Anomalies IA
            </button>
            <button 
              className={`text-[13px] font-bold flex items-center gap-1.5 ${currentPage === 'assistant' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('assistant')}
            >
              <span className="w-1.5 h-1.5 bg-brand-cyan animate-pulse rounded-full"></span> Assistant IA
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'generator' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('generator')}
            >
              Générateur
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'converter' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('converter')}
            >
              Convertisseur
            </button>
            <button 
              className={`text-[13px] font-bold ${currentPage === 'pipeline' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors`}
              onClick={() => setCurrentPage('pipeline')}
            >
              Pipeline
            </button>
            
            {/* Show only to Admin */}
            {userRole === 'admin' && (
              <button 
                className={`text-[13px] font-bold ${currentPage === 'admin' ? 'text-brand-magenta' : 'text-text-2 hover:text-navy'} transition-colors flex items-center gap-2`}
                onClick={() => setCurrentPage('admin')}
              >
                👥 Gestion
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-border pr-4">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-bold text-navy">Connecté</div>
              <div className="text-[11px] text-text-3 font-medium uppercase">{userRole === 'admin' ? 'Profil Admin' : 'Profil Analyste'}</div>
            </div>
            <div className={`w-[36px] h-[36px] rounded-full text-white flex items-center justify-center font-bold text-[14px] ${userRole === 'admin' ? 'bg-brand-magenta' : 'bg-brand-blue'}`}>
              {userRole === 'admin' ? 'AD' : 'AN'}
            </div>
          </div>
          <button 
            className="text-[12px] font-bold text-red hover:underline px-2 py-1"
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <div className="max-w-[1200px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
