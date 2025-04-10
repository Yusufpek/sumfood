import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <header className="App-header">
          <h1>Welcome to SumFood</h1>
          <p>Your favorite food, delivered fast and fresh!</p>
        </header>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <button
                onClick={() => alert('Browse our menu!')}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Browse Menu
              </button>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;