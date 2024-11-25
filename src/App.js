import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebaseConfig'; // Import Firebase Auth
import Login from './components/Login';
import StockSearch from './components/StockSearch';
import Portfolio from './components/Portfolio';
import Transactions from './components/Transactions'; // Import Transactions page
import Navbar from './components/Navbar';
import Home from './components/Home'; // Import Home page
import Footer from './components/Footer'; // Import Footer component

function App() {
  const [user, setUser] = useState(null); // Holds the current user
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update user state when auth state changes
      setLoading(false); // Once the user is set, stop loading
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // While the auth state is being checked, show loading spinner
  if (loading) {
    return <div>Loading...</div>; // You can customize this loading screen
  }

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        {/* Redirect logged-in users from login page */}
        <Route
          path="/login"
          element={user ? <Navigate to="/stock-search" /> : <Login />}
        />

        {/* Stock Search, Portfolio, Transactions are only accessible to logged-in users */}
        <Route
          path="/stock-search"
          element={user ? <StockSearch /> : <Navigate to="/login" />}
        />

        <Route
          path="/portfolio"
          element={user ? <Portfolio /> : <Navigate to="/login" />}
        />

        <Route
          path="/transactions"
          element={user ? <Transactions /> : <Navigate to="/login" />}
        />

        {/* Show Home page if the user is not logged in */}
        <Route
          path="/"
          element={!user ? <Home /> : <Navigate to="/stock-search" />}
        />
      </Routes>

      {/* Conditionally render Footer based on the current location */}
      <FooterCondition />
    </Router>
  );
}

function FooterCondition() {
  const location = useLocation();

  // Show Footer only on Home and Login pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return <Footer />;
  }
  return null;
}

export default App;
