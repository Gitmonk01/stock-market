import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import './Login.css'; // Optional: You can move styling to a separate CSS file for cleaner code

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('user', JSON.stringify(user)); // Store user info in localStorage
      navigate('/'); // Redirect to homepage (StockSearch) after successful login
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Virtual Trading</h1>
        <p>Log in to start managing your virtual stock portfolio</p>
        <button onClick={handleLogin} className="login-button">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
