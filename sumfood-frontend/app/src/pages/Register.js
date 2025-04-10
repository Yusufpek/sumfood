import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Register() {
  const [userType, setUserType] = useState('regular'); // 'regular', 'courier', 'restaurant'
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
    alert(`Registered: ${JSON.stringify(userData, null, 2)}`);
  };

  return (
    <div>
      <h2>Register</h2>
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
  );
}

export default Register;