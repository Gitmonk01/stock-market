import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import './Home.css'; // Optional: create this CSS file to style your Home page

const Home = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  // Function to handle button click and redirect
  const handleGetStartedClick = () => {
    navigate('/login'); // Redirect to Login page
  };

  return (
    <div className="home-container">
      <section className="intro">
        <h1>Welcome to Virtual Trading</h1>
        <p>Your gateway to stock market simulation. Buy, sell, and track stocks in a virtual environment without any real financial risk.</p>
      </section>

      {/* Platform Features Section */}
      <section className="features">
        <h2>Platform Features</h2>
        <div className="feature-items">
          <div className="feature-item">
            <h3>Stock Search</h3>
            <p>Access real-time stock data, analyze trends, and stay informed about the latest market updates.</p>
          </div>
          <div className="feature-item">
            <h3>Portfolio Management</h3>
            <p>Track your investments, manage your virtual portfolio, and visualize your progress over time.</p>
          </div>
          <div className="feature-item">
            <h3>Transactions</h3>
            <p>Buy and sell stocks seamlessly, monitor your trade history, and simulate real market conditions.</p>
          </div>
          <div className="feature-item">
            <h3>Access Anytime</h3>
            <p>Access your portfolio and transactions anytime, anywhere, with ease and security.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta">
        <h2>Get Started Today</h2>
        <p>Log in to start trading and building your virtual stock portfolio!</p>
        <button onClick={handleGetStartedClick} className="cta-button">
          Get Started
        </button>
      </section>
    </div>
  );
};

export default Home;
