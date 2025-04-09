import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 20px', 
      backgroundColor: '#333', 
      color: '#fff' 
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
        <h2>SumFood</h2>
      </Link>
      <div>
        <Link to="/login">
          <button
            style={{
              marginRight: '10px',
              padding: '5px 15px',
              fontSize: '14px',
              backgroundColor: '#ff6347',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </Link>
        <Link to="/register">
          <button
            style={{
              padding: '5px 15px',
              fontSize: '14px',
              backgroundColor: '#ff6347',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;