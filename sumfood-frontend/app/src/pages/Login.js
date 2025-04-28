import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthNavbar from '../components/layout/AuthNavbar';
import '../styles/auth.css';

function Login() {
  const [userType, setUserType] = useState('regular');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function login(credentials) {
    try {
      // Map frontend userType to backend Role enum - must match exactly what backend expects
      let role;
      switch(userType) {
        case 'regular':
          role = 'CUSTOMER';
          break;
        case 'courier':
          role = 'COURIER';
          break;
        case 'restaurant':
          role = 'RESTAURANT';
          break;
        default:
          role = 'CUSTOMER';
      }
      
      // Create the request body exactly as expected by backend
      const requestBody = {
        email: credentials.email,
        password: credentials.password,
        role: role
      };
      
      console.log('Sending login request with:', requestBody);
      
      // Don't stringify the body - axios will do that automatically
      const response = await axios.post(
        "http://localhost:8080/api/auth/login", 
        requestBody, 
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true // Important for CORS with credentials
        }
      );
      
      return response;
    } catch (error) {
      console.error('Full error object:', error);
      // Access the response data properly
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Enhanced error information
        if (error.response.data && error.response.data.message) {
          console.error('Server error message:', error.response.data.message);
        }
        
        throw error.response;
      } else {
        throw error;
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const credentials = {
      email: username,
      password: password
    };

    login(credentials)
      .then((response) => {
        console.log('Login successful:', response.data);
        
        // Store authentication token based on backend's LoginResponse
        localStorage.setItem('token', response.data.token);
        if (response.data.expiresIn) {
          localStorage.setItem('tokenExpiry', response.data.expiresIn);
        }
        localStorage.setItem('userType', userType);
        
        // Redirect to appropriate page based on user type
        if (userType === 'regular') {
          navigate('/main');
        } else if (userType === 'courier') {
          navigate('/courier-dashboard');
        } else if (userType === 'restaurant') {
          navigate('/restaurant-dashboard');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          setError('Invalid email or password');
        } else if (err.status === 403) {
          // Extract more specific error message if available
          const errorMessage = err.data && err.data.message 
            ? err.data.message 
            : 'Access forbidden. Check your credentials and permissions.';
          setError(errorMessage);
        } else {
          setError(`An error occurred (${err.status || 'unknown'}). Please try again.`);
        }
      });
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
          {error && <div className="error-message">{error}</div>}
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
