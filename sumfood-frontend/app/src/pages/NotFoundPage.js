import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="not-found-container" style={{
        textAlign: 'center',
        padding: '100px 20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1>404 - Page Not Found</h1>
        <p style={{ margin: '20px 0' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ marginTop: '30px' }}>
          <Link to="/" style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            Return to Home Page
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NotFoundPage;
