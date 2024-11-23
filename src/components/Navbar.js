import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {user ? (
          <>
            {/* Stock Search link */}
            <li>
              <Link to="/stock-search" className="navbar-link">Stock Search</Link>
            </li>

            {/* Portfolio link */}
            <li>
              <Link to="/portfolio" className="navbar-link">Portfolio</Link>
            </li>

            {/* Transactions link */}
            <li>
              <Link to="/transactions" className="navbar-link">Transactions</Link>
            </li>

            {/* Welcome message and Logout */}
            <li className="welcome-message">
              <span>Welcome, {user.displayName || user.email}</span>
            </li>
            <li className="logout-button">
              <button onClick={handleLogout} className="navbar-link">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Home link for non-logged-in users */}
            <li>
              <Link to="/" className="navbar-link">Home</Link>
            </li>

            {/* Login link for non-logged-in users */}
            <li>
              <Link to="/login" className="navbar-link">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
