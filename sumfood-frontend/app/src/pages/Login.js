import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/layout/AuthNavbar';
import '../styles/auth.css';

function Login() {
  const [userType, setUserType] = useState('regular');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${userType} with Username: ${username}`);
    
    // after successful login redirect to main page
    navigate('/main');
  };

  return (
    <>
      <AuthNavbar />
      <h2 className="page-title">Login</h2>
      <div className="auth-container">
        <form onSubmit={handleSubmit}>
          <div className="button-group">
            <button
              type="button"
              className={userType === 'regular' ? 'active' : ''}
              onClick={() => setUserType('regular')}
            >
              User
            </button>
            <button
              type="button"
              className={userType === 'courier' ? 'active' : ''}
              onClick={() => setUserType('courier')}
            >
              Courier
            </button>
            <button
              type="button"
              className={userType === 'restaurant' ? 'active' : ''}
              onClick={() => setUserType('restaurant')}
            >
              Restaurant
            </button>
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </>
  );
}

export default Login;
