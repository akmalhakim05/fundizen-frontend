import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import Dashboard from './components/Dashboard';
import CampaignList from './components/campaigns/CampaignList';
import CreateCampaign from './components/campaigns/CreateCampaign';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/global.css';

// Home component
const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Fund Your Dreams with <span className="highlight">Fundizen</span>
          </h1>
          <p className="hero-description">
            The crowdfunding platform that brings communities together to support 
            amazing projects and causes. Start your campaign or discover projects 
            that need your support.
          </p>
          <div className="hero-actions">
            <a href="/register" className="btn btn-primary btn-large">
              Start Your Campaign
            </a>
            <a href="/campaigns" className="btn btn-outline btn-large">
              Browse Projects
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <span className="graphic-icon">🚀</span>
            <span className="graphic-text">Launch Your Ideas</span>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Fundizen?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Your campaigns and donations are protected with enterprise-grade security.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Driven</h3>
              <p>Connect with supporters who believe in your vision and want to help.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Easy to Use</h3>
              <p>Simple campaign creation and management tools that anyone can use.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💯</div>
              <h3>Transparent</h3>
              <p>All campaigns are reviewed and verified for authenticity and quality.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of creators and supporters on Fundizen</p>
          <a href="/register" className="btn btn-primary btn-large">
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
};

// About component
const About = () => (
  <div className="page-container">
    <h1>About Fundizen</h1>
    <p>Fundizen is a crowdfunding platform dedicated to helping creators bring their projects to life.</p>
  </div>
);

// Contact component  
const Contact = () => (
  <div className="page-container">
    <h1>Contact Us</h1>
    <p>Get in touch with our team for support or partnerships.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<CampaignList />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/create-campaign" 
                element={
                  <PrivateRoute>
                    <CreateCampaign />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;