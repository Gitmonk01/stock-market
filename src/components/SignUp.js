import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Redirect to the StockPriceFetcher page after login
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Sign Up</h1>
      <button 
        onClick={handleSignUp} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Sign Up with Google
      </button>
    </div>
  );
};

export default SignUp;
