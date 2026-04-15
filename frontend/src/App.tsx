import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Validation from './pages/Validation'
import Comparateur from './pages/Comparateur'
import Anomalies from './pages/Anomalies'
import AIAssistant from './pages/AIAssistant'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Generator from './pages/Generator'
import Converter from './pages/Converter'
import Pipeline from './pages/Pipeline'
import Admin from './pages/Admin'
import Layout from './components/Layout'
import { AnalysisProvider } from './contexts/AnalysisContext'

export type UserRole = 'admin' | 'analyst' | null;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
};

type AuthPayload = {
  token: string;
  user: AuthUser;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'paramiq_token';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleAuth = (payload: AuthPayload) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    setIsAuthenticated(true);
    setUserRole(payload.user.role);
    setAuthUser(payload.user);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Keep local logout flow even if API call fails.
      }
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
    setUserRole(null);
    setAuthUser(null);
    setCurrentPage('home');
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Session expirée');
        }

        const user = await response.json();
        setIsAuthenticated(true);
        setUserRole(user.role as UserRole);
        setAuthUser({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
        setCurrentPage('dashboard');
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setIsAuthenticated(false);
        setUserRole(null);
        setAuthUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    bootstrapSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && ['home', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-border rounded-xl px-6 py-4 text-deepBlue font-bold shadow-sm">
          Vérification de la session...
        </div>
      </div>
    );
  }

  // Prevent accessing protected routes without auth
  if (!isAuthenticated) {
    if (currentPage === 'login') return <Login onAuth={handleAuth} onNavigate={setCurrentPage} />
    if (currentPage === 'register') return <Register onAuth={handleAuth} onNavigate={setCurrentPage} />
    if (currentPage === 'home') return <Landing onNavigate={setCurrentPage} />
    
    // Default to login if they try to access any protected page (dashboard, etc)
    return <Login onAuth={handleAuth} onNavigate={setCurrentPage} />
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
