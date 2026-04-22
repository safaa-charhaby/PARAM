import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Validation from './pages/Validation'
import Comparateur from './pages/Comparateur'
import Anomalies from './pages/Anomalies'
import AIAssistant from './pages/AIAssistant'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Generator from './pages/Generator'
import Converter from './pages/Converter'
import Pipeline from './pages/Pipeline'
import Admin from './pages/Admin'
import Layout from './components/Layout'
import { AnalysisProvider } from './contexts/AnalysisContext'
import { keycloak } from './keycloak'

export type UserRole = 'admin' | 'analyst' | null;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false }).then(authenticated => {
      setIsAuthenticated(authenticated);
      if (authenticated && keycloak.tokenParsed) {
        const realmAccess = keycloak.tokenParsed.realm_access as { roles: string[] } | undefined;
        let role: UserRole = 'analyst';
        if (realmAccess?.roles.includes('admin')) {
          role = 'admin';
        }
        
        setUserRole(role);
        setAuthUser({
          id: keycloak.tokenParsed.sub || '',
          name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username || '',
          email: keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username || '',
          role: role,
        });
        
        // Save token to localStorage for backend requests
        if (keycloak.token) {
          localStorage.setItem('paramiq_token', keycloak.token);
        }
        
        if (currentPage === 'home' || currentPage === 'login') {
          setCurrentPage('dashboard');
        }
      }
      setIsCheckingSession(false);
    }).catch(err => {
      console.error('Failed to initialize Keycloak', err);
      setIsCheckingSession(false);
    });

    // Auto-refresh token
    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(30).then(refreshed => {
          if (refreshed && keycloak.token) {
            localStorage.setItem('paramiq_token', keycloak.token);
          }
        }).catch(() => {
          keycloak.logout();
        });
      }
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('paramiq_token');
    keycloak.logout({ redirectUri: window.location.origin });
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-border rounded-xl px-6 py-4 text-deepBlue font-bold shadow-sm">
          Initialisation de la connexion...
        </div>
      </div>
    );
  }

  // Prevent accessing protected routes without auth
  if (!isAuthenticated) {
    if (currentPage === 'home') return <Landing onNavigate={setCurrentPage} />
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'validation':
        return <Validation onNavigate={setCurrentPage} />
      case 'comparateur':
        return <Comparateur onNavigate={setCurrentPage} />
      case 'anomalies':
        return <Anomalies onNavigate={setCurrentPage} />
      case 'assistant':
        return <AIAssistant />
      case 'generator':
        return <Generator />
      case 'converter':
        return <Converter />
      case 'pipeline':
        return <Pipeline />
      case 'admin':
        return <Admin />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <AnalysisProvider>
      <Layout 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userRole={userRole} 
        userName={authUser?.name}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
    </AnalysisProvider>
  )
}

export default App
