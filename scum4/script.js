// frontend/src/main.jsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  function save(session) {
    localStorage.setItem('token', session.token);
    localStorage.setItem('user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
  }

  return { token, user, save, logout };
}

function Login({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const url = `${API_BASE}/auth/${mode}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(mode === 'register' ? { email, password, role } : { email, password })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Erreur'); return; }
    onAuth(data);
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <div className="app-bg">
        <div className="lightning-layer">
          <div className="lightning-bolt"></div>
          <div className="lightning-bolt"></div>
          <div className="lightning-bolt"></div>
          <div className="lightning-bolt"></div>
        </div>
      </div>
      <div className="panel" style={{ width: 380 }}>
        <h2 style={{ marginTop: 0 }}>SCUM Admin</h2>
        <p className="badge">Connexion {mode === 'login' ? 'utilisateur' : 'nouveau compte'}</p>
        <form onSubmit={submit} className="grid" style={{ gap: 12 }}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {mode === 'register' && (
            <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          )}
          {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
          <div style={{ display:'flex', gap: 8 }}>
            <button className="btn primary" type="submit">{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</button>
            <button className="btn" type="button" onClick={()=>setMode(m=> m==='login'?'register':'login')}>
              {mode === 'login' ? 'Créer un compte' : 'Déjà inscrit ?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [status, setStatus] = useState({ connectedCount: 0, adminConnectedCount: 0, players: [] });
  const [vehicles, setVehicles] = useState([]);

  async function fetchStatus() {
    const res = await fetch(`${API_BASE}/status`, { headers: { Authorization: `Bearer ${token}` }});
    const data = await res.json();
    if (res.ok) setStatus(data);
  }
  async function fetchVehicles() {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` }});
    const data = await res.json();
    if (res.ok) setVehicles(data.vehicles || []);
  }

  useEffect(() => {
    fetchStatus(); fetchVehicles();
    const id = setInterval(() => { fetchStatus(); fetchVehicles(); }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div className="app-bg">
        <div className="lightning-layer">
          <div className="lightning-bolt"></div>
          <div className="lightning-bolt"></div>
          <div className="lightning-bolt"></div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span className="badge">{user?.email} · {user?.role}</span>
          <button className="btn" onClick={onLogout}>Déconnexion</button>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="panel kpi"><span className="badge">Joueurs connectés</span><span className="kpi-value">{status.connectedCount}</span></div>
        <div className="panel kpi"><span className="badge">Admins connectés</span><span className="kpi-value">{status.adminConnectedCount}</span></div>
        <div className="panel kpi"><span className="badge">Véhicules listés</span><span className="kpi-value">{vehicles.length}</span></div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Véhicules</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Propriétaire</th><th>État</th><th>Localisation (X,Y,Z)</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.type}</td>
                <td>{v.owner}</td>
                <td>{typeof v.state === 'number' ? `${Math.round(v.state*100)}%` : v.state}</td>
                <td>{[v.location?.x, v.location?.y, v.location?.z].filter(x=>x!==undefined && x!==null).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const auth = useAuth();
  if (!auth.token) return <Login onAuth={auth.save} />;
  return <Dashboard token={auth.token} user={auth.user} onLogout={auth.logout} />;
}

createRoot(document.getElementById('root')).render(<App />);
