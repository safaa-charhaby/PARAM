import React from 'react';
import type { UserRole } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userRole?: UserRole;
  userName?: string;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, userRole, userName, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-bg">
      {/* Top Navbar Corporate */}
      <header className="h-[70px] bg-white border-b-2 border-border flex items-center justify-between px-6 lg:px-8 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-3 font-heading font-extrabold text-[18px] text-deepBlue cursor-pointer"
            onClick={() => setCurrentPage('dashboard')}
          >
            <div className="w-[32px] h-[32px] bg-magenta text-white flex items-center justify-center font-bold text-[16px]">
              P
            </div>
            ParamIQ
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'dashboard' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'validation' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('validation')}
            >
              Validation
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'comparateur' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('comparateur')}
            >
              Comparateur
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'anomalies' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('anomalies')}
            >
              Anomalies IA
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${currentPage === 'assistant' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('assistant')}
            >
              <span className="w-1.5 h-1.5 bg-cyan rounded-full"></span> Assistant IA
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'generator' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('generator')}
            >
              Générateur
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'converter' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('converter')}
            >
              Convertisseur
            </button>
            <button 
              className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'pipeline' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors`}
              onClick={() => setCurrentPage('pipeline')}
            >
              Pipeline
            </button>
            
            {/* Show only to Admin */}
            {userRole === 'admin' && (
              <button 
                className={`text-[12px] uppercase tracking-wider font-bold ${currentPage === 'admin' ? 'text-magenta border-b-2 border-magenta' : 'text-text-2 hover:text-deepBlue'} h-[70px] transition-colors flex items-center gap-2`}
                onClick={() => setCurrentPage('admin')}
              >
                Administration
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 border-r border-border pr-5">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-bold text-deepBlue">{userName || 'Connecté'}</div>
              <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest">{userRole === 'admin' ? 'Super Admin' : 'Analyste XBRL'}</div>
            </div>
            <div className={`w-[40px] h-[40px] rounded-sm text-white flex items-center justify-center font-bold text-[14px] ${userRole === 'admin' ? 'bg-deepBlue' : 'bg-cyan text-deepBlue'}`}>
              {userRole === 'admin' ? 'AD' : 'AN'}
            </div>
          </div>
          <button 
            className="text-[12px] font-bold text-text-3 hover:text-magenta uppercase tracking-wider px-2 py-1 transition-colors"
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
