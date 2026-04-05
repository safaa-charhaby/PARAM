import { useState } from 'react'
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

export type UserRole = 'admin' | 'analyst' | null;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleAuth = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role as UserRole);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentPage('home');
  };

  // Prevent accessing protected routes without auth
  if (!isAuthenticated) {
    if (currentPage === 'login') return <Login onAuth={handleAuth} onNavigate={setCurrentPage} />
    if (currentPage === 'register') return <Register onAuth={handleAuth} onNavigate={setCurrentPage} />
    if (currentPage === 'home') return <Landing onNavigate={setCurrentPage} />
    
    // Default to login if they try to access any protected page (dashboard, etc)
    return <Login onAuth={handleAuth} onNavigate={setCurrentPage} />
  }

  // Inside layout, if user is auth but tries to view home/login/register, force dashboard
  if (['home', 'login', 'register'].includes(currentPage)) {
    setCurrentPage('dashboard');
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
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      userRole={userRole} 
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  )
}

export default App
