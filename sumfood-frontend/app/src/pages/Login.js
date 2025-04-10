import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Login() {
  const [userType, setUserType] = useState('regular'); // 'regular', 'courier', 'restaurant'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    alert(`Logging in as ${userType} with Username: ${username}`);
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
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
  );
}

export default Login;