import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/layout/AuthNavbar';
import '../styles/auth.css';

function Register() {
  const [userType, setUserType] = useState('regular');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [driverLicenseId, setDriverLicenseId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    const userData = {
      userType,
      name,
      lastName,
      email,
      phoneNumber,
      password,
      ...(userType === 'courier' && { driverLicenseId, birthDate }),
      ...(userType === 'restaurant' && { taxId, businessName, displayName, description }),
    };
    console.log(`Registered: ${JSON.stringify(userData, null, 2)}`);
    
    // redirect to login after successful registration
    navigate('/login');
  };

  return (
    <>
    <AuthNavbar />
      <h2 className="page-title">Register</h2>
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
            <label>{userType === 'restaurant' ? 'Owner Name' : 'Name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{userType === 'restaurant' ? 'Owner Last Name' : 'Last Name'}</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
          {userType === 'courier' && (
            <>
              <div>
                <label>Driver License ID</label>
                <input
                  type="text"
                  value={driverLicenseId}
                  onChange={(e) => setDriverLicenseId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          {userType === 'restaurant' && (
            <>
              <div>
                <label>Tax ID Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </>
  );
}

export default Register;
