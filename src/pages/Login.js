import React, { useState } from 'react';
import users from '../data/users';

const toSessionUser = (user) => ({
  id: user.id || user.username,
  username: user.username,
  name: user.name,
  role: user.role
});

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Authentification locale de demonstration. A remplacer par Firebase Auth.
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (found) {
      setError('');
      onLogin(toSessionUser(found));
    } else {
      setError('Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: '#f8fafc'
      }}
    >
      <div style={{ fontSize: '42px', marginBottom: '8px' }}>✈️</div>
      <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '24px' }}>Aviation Portal</h1>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>SEPRET — Connexion</p>

      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}>
        <label style={{ marginTop: 0 }}>IDENTIFIANT</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label>MOT DE PASSE</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>{error}</p>}

        <button type="submit" className="btn-next" style={{ width: '100%', marginTop: '18px' }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}
