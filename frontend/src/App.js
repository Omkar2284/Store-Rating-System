import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [view, setView] = useState('login');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [data, setData] = useState({ stats: {}, users: [], stores: [], owner: {} });

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, sort]);

  const load = async () => {
    const config = { 
      headers: { Authorization: `Bearer ${token}` }, 
      params: { 
        search: search.trim(), 
        sortBy: sort.key, 
        order: sort.dir 
      } 
    };

    try {
      if (role === 'Admin') {
        const res = await axios.get(`${API}/admin/data`, config);
        setData({ 
          stats: res.data.stats || {}, 
          users: res.data.users || [], 
          stores: res.data.stores || [], 
          owner: {} 
        });
      } else if (role === 'Normal') {
        const res = await axios.get(`${API}/user/stores`, config);
        setData(prev => ({ ...prev, stores: res.data || [] }));
      } else if (role === 'StoreOwner') {
        const res = await axios.get(`${API}/owner/dashboard`, config);
        setData(prev => ({ ...prev, owner: res.data || {} }));
      }
    } catch (e) { 
      console.log("Load error", e); 
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const path = view === 'login' ? '/auth/login' : '/auth/signup';
      const res = await axios.post(API + path, form);
      if (view === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        setToken(res.data.token);
        setRole(res.data.role);
      } else {
        alert("Account Created! You can now login.");
        setView('login');
      }
    } catch (err) { 
      alert("Error: " + (err.response?.data?.error || "Connection failed")); 
    }
  };

  const logout = () => { 
    localStorage.clear(); 
    window.location.reload(); 
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h2>Store Rating System</h2>
        {token && <button className="logout-btn" onClick={logout}>Logout</button>}
      </nav>

      {!token ? (
        <div className="login-box">
          <h2>{view === 'login' ? 'Login' : 'Signup'}</h2>
          <form onSubmit={handleAuth}>
            {view === 'signup' && (
              <>
                <input placeholder="Name (20-60 characters)" onChange={e => setForm({...form, name: e.target.value})} required />
                <input placeholder="Address (Max 400 chars)" onChange={e => setForm({...form, address: e.target.value})} required />
              </>
            )}
            <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
            <input type="password" placeholder="Password (8-16 chars, 1 Upper, 1 Special)" onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="submit">{view === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <p className="toggle-text" onClick={() => setView(view === 'login' ? 'signup' : 'login')}>
            {view === 'login' ? "New user? Create Account" : "Already have an account? Login"}
          </p>
        </div>
      ) : (
        <div className="container">
          <div className="controls">
            <input placeholder="Search..." onChange={e => setSearch(e.target.value)} />
            <select onChange={e => setSort({...sort, key: e.target.value})}>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
            </select>
          </div>

          {role === 'Admin' && (
            <div className="admin-view">
              <div className="stats">
                <div className="card"><h3>{data.stats.totalUsers || 0}</h3><p>Users</p></div>
                <div className="card"><h3>{data.stats.totalStores || 0}</h3><p>Stores</p></div>
                <div className="card"><h3>{data.stats.totalRatings || 0}</h3><p>Ratings</p></div>
              </div>
              
              <h3>Registered Users</h3>
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {(data.users || []).map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge">{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{marginTop:'30px'}}>Registered Stores</h3>
              <table>
                <thead><tr><th>Store Name</th><th>Address</th><th>Avg Rating</th></tr></thead>
                <tbody>
                  {(data.stores || []).map((s, index) => (
                    <tr key={index}>
                      <td>{s.name}</td>
                      <td>{s.address}</td>
                      <td>{Number(s.overallRating || 0).toFixed(1)} ★</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {role === 'StoreOwner' && (
            <div className="owner-view">
              <h2>Dashboard: {data.owner.storeName || 'My Store'}</h2>
              <div className="card" style={{width:'150px'}}><h3>{data.owner.averageRating || 0} ★</h3><p>Avg Rating</p></div>
              <h3 style={{marginTop:'20px'}}>Who Rated You:</h3>
              <table>
                <thead><tr><th>User Name</th><th>Rating</th></tr></thead>
                <tbody>
                  {(data.owner.ratings || []).map((r, i) => (
                    <tr key={i}><td>{r.userName}</td><td>{r.rating} ★</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {role === 'Normal' && (
            <div className="stats">
              {(data.stores || []).map(s => (
                <div key={s.id} className="card">
                  <h4>{s.name}</h4>
                  <p>{s.address}</p>
                  <h3>{Number(s.overallRating || 0).toFixed(1)} ★</h3>
                  <div style={{marginTop:'10px'}}>
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} 
                        onClick={() => axios.post(`${API}/user/rate`, {storeId: s.id, rating: n}, {headers:{Authorization:`Bearer ${token}`}}).then(load)} 
                        style={{margin:'2px', cursor:'pointer'}}
                      > 
                        {n}★ 
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;