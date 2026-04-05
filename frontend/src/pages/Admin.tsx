import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  status: 'active' | 'inactive';
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Oumaima OUMAS', email: 'oumaima@sbs.com', role: 'admin', status: 'active' },
    { id: '2', name: 'Jean Dupont', email: 'jean.dupont@sbs.com', role: 'analyst', status: 'active' },
    { id: '3', name: 'Marie Leclerc', email: 'marie.leclerc@sbs.com', role: 'analyst', status: 'inactive' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSave = () => {
    if (currentUser.id) {
      setUsers(users.map(u => u.id === currentUser.id ? (currentUser as User) : u));
    } else {
      const newUser = { ...currentUser, id: Math.random().toString(36).substr(2, 9), status: 'active' } as User;
      setUsers([...users, newUser]);
    }
    setIsEditing(false);
    setCurrentUser({});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-heading font-bold text-navy">Gestion des Utilisateurs & Rôles</h2>
          <p className="text-[14px] text-text-2">Console d'administration pour gérer les accès à la plateforme ParamIQ.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setCurrentUser({ role: 'analyst' }); }}
          className="px-5 py-2.5 bg-orange text-white rounded-lg text-[14px] font-bold shadow-lg hover:bg-orange-h transition-all"
        >
          + Ajouter un utilisateur
        </button>
      </div>

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
            {users.map(user => (
              <tr key={user.id} className="hover:bg-bg/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] ${user.role === 'admin' ? 'bg-orange' : 'bg-blue'}`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-navy">{user.name}</div>
                      <div className="text-[12px] text-text-3">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-orange/10 text-orange' : 'bg-blue/10 text-blue'}`}>
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
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[500px] w-full p-8 border border-border">
            <h3 className="text-[20px] font-heading font-bold text-navy mb-6">
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
                  value={currentUser.role}
                  onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as 'admin' | 'analyst' })}
                >
                  <option value="analyst">Analyste</option>
                  <option value="admin">Administrateur</option>
                </select>
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
                className="px-6 py-2 bg-orange text-white rounded-lg text-[14px] font-bold shadow-lg hover:bg-orange-h transition-all"
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
