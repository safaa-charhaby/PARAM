import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  status: 'active' | 'inactive';
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> & { password?: string }>({});

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('paramiq_token');
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json().catch(() => ([]));
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de charger les utilisateurs');
      }
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les utilisateurs';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('paramiq_token');
        const response = await fetch(`${API_BASE}/api/admin/users/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Suppression impossible');
        }
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Suppression impossible';
        setError(message);
      }
    }
  };

  const handleSave = async () => {
    if (!currentUser.name || !currentUser.email || !currentUser.role) {
      setError('Nom, email et rôle sont requis');
      return;
    }

    setError('');
    const token = localStorage.getItem('paramiq_token');
    
    if (currentUser.id) {
      try {
        const response = await fetch(`${API_BASE}/api/admin/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            status: currentUser.status || 'active',
            password: currentUser.password || undefined,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Mise à jour impossible');
        }
        await fetchUsers();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Mise à jour impossible';
        setError(message);
        return;
      }
    } else {
      try {
        const response = await fetch(`${API_BASE}/api/admin/users`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            status: currentUser.status || 'active',
            password: currentUser.password || 'ChangeMe123!',
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Création impossible');
        }
        await fetchUsers();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Création impossible';
        setError(message);
        return;
      }
    }

    setIsEditing(false);
    setCurrentUser({});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-heading font-bold text-deepBlue">Gestion des Utilisateurs & Rôles</h2>
          <p className="text-[14px] text-text-2">Console d'administration pour gérer les accès à la plateforme ParamIQ.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setCurrentUser({ role: 'analyst', status: 'active' }); }}
          className="px-5 py-2.5 bg-magenta text-white rounded-lg text-[14px] font-bold shadow-lg hover:bg-magenta-h transition-all"
        >
          + Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-border">
              <th className="px-6 py-4 text-[12px] font-bold text-text-3 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-4 text-[12px] font-bold text-text-3 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-[12px] font-bold text-text-3 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-[12px] font-bold text-text-3 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-3">Chargement des utilisateurs...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-3">Aucun utilisateur en base.</td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-bg/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] ${user.role === 'admin' ? 'bg-magenta' : 'bg-blue'}`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-deepBlue">{user.name}</div>
                      <div className="text-[12px] text-text-3">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-magenta/10 text-magenta' : 'bg-blue/10 text-blue'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-[13px] ${user.status === 'active' ? 'text-green' : 'text-text-3'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green' : 'bg-text-3'}`}></span>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setIsEditing(true); setCurrentUser(user); }}
                      className="text-[13px] font-bold text-blue hover:underline"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-[13px] font-bold text-red hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-deepBlue/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[500px] w-full p-8 border border-border">
            <h3 className="text-[20px] font-heading font-bold text-deepBlue mb-6">
              {currentUser.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-text-2 mb-1 uppercase">Nom Complet</label>
                <input 
                  type="text" 
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-[14px]"
                  value={currentUser.name || ''}
                  onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-text-2 mb-1 uppercase">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-[14px]"
                  value={currentUser.email || ''}
                  onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-text-2 mb-1 uppercase">Rôle</label>
                <select 
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-[14px]"
                  value={currentUser.role || 'analyst'}
                  onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as 'admin' | 'analyst' })}
                >
                  <option value="analyst">Analyste</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-text-2 mb-1 uppercase">Statut</label>
                <select
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-[14px]"
                  value={currentUser.status || 'active'}
                  onChange={e => setCurrentUser({ ...currentUser, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-text-2 mb-1 uppercase">Mot de passe (optionnel)</label>
                <input
                  type="password"
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-[14px]"
                  placeholder={currentUser.id ? 'Laisser vide pour ne pas changer' : 'Définir mot de passe'}
                  value={currentUser.password || ''}
                  onChange={e => setCurrentUser({ ...currentUser, password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 text-[14px] font-bold text-text-2 hover:bg-bg rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-magenta text-white rounded-lg text-[14px] font-bold shadow-lg hover:bg-magenta-h transition-all"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
