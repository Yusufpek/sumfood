import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
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
  const [driverLicenceId, setDriverLicenceId] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    const userData = {
      name,
      lastName,
      email,
      phoneNumber,
      password,
      ...(userType === 'courier' && { driverLicenceId, birthDate, vehicleType }),
      ...(userType === 'restaurant' && { taxId, businessName, displayName, description, city, address, logo }),
    };

    register(userData)
      .then((response) => {
        if (userType === 'restaurant') {
          alert(`Registered: ${userData['displayName']}`);
        } else {
          alert(`Registered: ${response.data['username']}`);
        }
        // redirect to login after successful registration
        navigate('/login');
      })
      .catch((e) => {
        if (e.status === 409) {
          alert("This email already in use!");
        } else {
          alert("Something went wrong! " + e['message']);
        }
      });
  }

  async function register(userData) {
    let url = "http://localhost:8080/api/auth/register/";
    let body;
    if (userType === 'restaurant') {
      body = FormData()
      userData['taxIdentificationNumber'] = userData['taxId'];
      url += userType;
      body.append('restaurantRegistration', new Blob([JSON.stringify(userData)], { type: 'application/json' }));
      body.append('file', logo);
    } else {
      if (userType === 'regular') {
        url += "customer";
      } else {
        url += userType;
      }
      body = JSON.stringify(userData, null, 2);
    }
    console.log("body", body);
    const response = await axios.post(url, body);
    return response;
  }

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
                  value={driverLicenceId}
                  onChange={(e) => setDriverLicenceId(e.target.value)}
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
              <div>
                <label>Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  style={{
                    width: '80%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}>
                  <option value="">Select vehicle type</option>
                  <option value="CAR">Car</option>
                  <option value="BICYCLE">Bicycle</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                </select>
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
              <div>
                <label>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Address</label>
                <textarea
                  style={{ height: '100px' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Restaurant Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        console.log('File preview:', reader.result);
                      };
                      reader.readAsDataURL(file);
                      setLogo(file);
                    }
                  }}
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
