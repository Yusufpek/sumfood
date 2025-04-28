import React from 'react';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <nav className="auth-navbar">
      <div className="auth-navbar-logo">
        <Link to="/">SumFood</Link>
      </div>
      <div className="auth-navbar-links">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </nav>
  );
};

export default AuthNavbar;
