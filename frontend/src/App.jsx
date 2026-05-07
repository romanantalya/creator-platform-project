import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE_URL = '/api'; // Прокси настроен в vite.config.js

function Home() {
  return <h2>Home</h2>;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return token ? children : null; // Или можно рендерить лоадер
}

function Login({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);

      // Fetch user data after successful login
      const userResponse = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await userResponse.json();
      setUser(userData);

      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function Register({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role_name: role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      // After successful registration, automatically log in
      const loginResponse = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || 'Auto-login failed after registration');
      }

      const loginData = await loginResponse.json();
      localStorage.setItem('access_token', loginData.access_token);
      setToken(loginData.access_token);
      setUser(data); // Set user data from registration response

      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="creator">Creator</option>
            <option value="project_manager">Project Manager</option>
            <option value="administrator">Administrator</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function CustomerDashboard({ user }) {
  return (
    <div>
      <h2>Customer Dashboard</h2>
      {user && <p>Welcome, {user.email} (Role: Customer)</p>}
    </div>
  );
}

function CreatorDashboard({ user }) {
  return (
    <div>
      <h2>Creator Dashboard</h2>
      {user && <p>Welcome, {user.email} (Role: Creator)</p>}
    </div>
  );
}

function ProjectManagerDashboard({ user }) {
  return (
    <div>
      <h2>Project Manager Dashboard</h2>
      {user && <p>Welcome, {user.email} (Role: Project Manager)</p>}
    </div>
  );
}

function AdminDashboard({ user }) {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {user && <p>Welcome, {user.email} (Role: Administrator)</p>}
      <p>This is a protected route for administrators.</p>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          setToken(null);
          localStorage.removeItem('access_token');
        }
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {!token ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            ) : (
              <li><button onClick={handleLogout}>Logout</button></li>
            )}
            {user && user.role_id === 1 && <li><Link to="/customer">Customer Dashboard</Link></li>} {/* Assuming role_id 1 is Customer */}
            {user && user.role_id === 2 && <li><Link to="/creator">Creator Dashboard</Link></li>}     {/* Assuming role_id 2 is Creator */}
            {user && user.role_id === 3 && <li><Link to="/project-manager">Project Manager Dashboard</Link></li>} {/* Assuming role_id 3 is Project Manager */}
            {user && user.role_id === 4 && <li><Link to="/admin">Admin Dashboard</Link></li>}           {/* Assuming role_id 4 is Administrator */}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<Register setToken={setToken} setUser={setUser} />} />

          {/* Protected Routes */}
          <Route path="/customer" element={<ProtectedRoute><CustomerDashboard user={user} /></ProtectedRoute>} />
          <Route path="/creator" element={<ProtectedRoute><CreatorDashboard user={user} /></ProtectedRoute>} />
          <Route path="/project-manager" element={<ProtectedRoute><ProjectManagerDashboard user={user} /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard user={user} /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
