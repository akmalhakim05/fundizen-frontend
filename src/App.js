import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import Dashboard from './components/Dashboard';
import CampaignList from './components/campaigns/CampaignList';
import CampaignDetails from './components/campaigns/CampaignDetails';
import CreateCampaign from './components/campaigns/CreateCampaign';
import DonationSuccess from './components/donations/DonationSuccess';
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
    
    <div className="about-content">
      <section>
        <h2>Our Mission</h2>
        <p>
          We believe in the power of community-driven funding to turn dreams into reality. 
          Our platform connects passionate creators with generous supporters who share their vision.
        </p>
      </section>
      
      <section>
        <h2>How It Works</h2>
        <div className="how-it-works">
          <div className="step">
            <h3>1. Create Your Campaign</h3>
            <p>Tell your story, set your funding goal, and share your vision with the world.</p>
          </div>
          <div className="step">
            <h3>2. Share & Promote</h3>
            <p>Spread the word through social media, email, and personal networks.</p>
          </div>
          <div className="step">
            <h3>3. Receive Support</h3>
            <p>Watch as supporters contribute to your campaign and help make your dream a reality.</p>
          </div>
        </div>
      </section>
      
      <section>
        <h2>Our Commitment</h2>
        <p>
          We're committed to providing a secure, transparent, and user-friendly platform 
          for both campaign creators and supporters. Every donation is processed securely, 
          and we maintain strict verification standards for all campaigns.
        </p>
      </section>
    </div>
  </div>
);

// Contact component  
const Contact = () => (
  <div className="page-container">
    <h1>Contact Us</h1>
    <p>Get in touch with our team for support, partnerships, or general inquiries.</p>
    
    <div className="contact-content">
      <section>
        <h2>Support</h2>
        <p>
          Need help with your campaign or donation? Our support team is here to assist you.
        </p>
        <ul>
          <li>📧 Email: support@fundizen.com</li>
          <li>📞 Phone: +60 3-1234 5678</li>
          <li>💬 Live Chat: Available 9 AM - 6 PM (MYT)</li>
        </ul>
      </section>
      
      <section>
        <h2>Business Inquiries</h2>
        <p>
          Interested in partnerships or business opportunities?
        </p>
        <ul>
          <li>📧 Email: business@fundizen.com</li>
          <li>📍 Address: Kuala Lumpur, Malaysia</li>
        </ul>
      </section>
      
      <section>
        <h2>Media & Press</h2>
        <p>
          Media inquiries and press releases.
        </p>
        <ul>
          <li>📧 Email: press@fundizen.com</li>
        </ul>
      </section>
      
      <div className="contact-form">
        <h3>Send us a message</h3>
        <p>
          For immediate assistance, please use our contact form on the main website 
          or reach out through the channels above.
        </p>
      </div>
    </div>
  </div>
);

// Privacy Policy component
const PrivacyPolicy = () => (
  <div className="page-container">
    <h1>Privacy Policy</h1>
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    
    <div className="policy-content">
      <section>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, 
          start a campaign, make a donation, or contact us for support.
        </p>
      </section>
      
      <section>
        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, and communicate with you.
        </p>
      </section>
      
      <section>
        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this policy.
        </p>
      </section>
      
      <section>
        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>
      
      <section>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at 
          privacy@fundizen.com.
        </p>
      </section>
    </div>
  </div>
);

// Terms of Service component
const TermsOfService = () => (
  <div className="page-container">
    <h1>Terms of Service</h1>
    <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
    
    <div className="terms-content">
      <section>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Fundizen, you accept and agree to be bound by the terms 
          and provision of this agreement.
        </p>
      </section>
      
      <section>
        <h2>Use License</h2>
        <p>
          Permission is granted to temporarily use Fundizen for personal, non-commercial 
          transitory viewing only.
        </p>
      </section>
      
      <section>
        <h2>User Responsibilities</h2>
        <p>
          Users are responsible for maintaining the confidentiality of their account 
          information and for all activities that occur under their account.
        </p>
      </section>
      
      <section>
        <h2>Campaign Guidelines</h2>
        <p>
          All campaigns must comply with our community guidelines and applicable laws. 
          We reserve the right to remove campaigns that violate these terms.
        </p>
      </section>
      
      <section>
        <h2>Payment Terms</h2>
        <p>
          All donations are processed securely through our payment partners. 
          Fees and processing times may apply.
        </p>
      </section>
      
      <section>
        <h2>Contact</h2>
        <p>
          Questions about the Terms of Service should be sent to us at legal@fundizen.com.
        </p>
      </section>
    </div>
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
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<CampaignList />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              
              {/* Donation Success Routes */}
              <Route path="/donation/success" element={<DonationSuccess />} />
              <Route path="/donation/cancelled" element={<DonationCancelled />} />
              
              {/* Protected User Routes */}
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
              <Route 
                path="/my-campaigns" 
                element={
                  <PrivateRoute>
                    <MyCampaigns />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/my-donations" 
                element={
                  <PrivateRoute>
                    <MyDonations />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Donation Cancelled Component
const DonationCancelled = () => (
  <div className="page-container">
    <div className="donation-cancelled">
      <div className="cancelled-icon">❌</div>
      <h1>Donation Cancelled</h1>
      <p>
        Your donation was cancelled. No charges have been made to your account.
      </p>
      <p>
        If you'd like to try again or need assistance, please feel free to 
        <a href="/contact"> contact our support team</a>.
      </p>
      <div className="cancelled-actions">
        <a href="/campaigns" className="btn btn-primary">
          Browse Campaigns
        </a>
        <a href="/dashboard" className="btn btn-outline">
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
);

// My Campaigns Component (placeholder)
const MyCampaigns = () => (
  <div className="page-container">
    <h1>My Campaigns</h1>
    <p>View and manage your campaigns here.</p>
    <div className="coming-soon">
      <h3>🚧 Coming Soon</h3>
      <p>This feature will be available in the next update.</p>
    </div>
  </div>
);

// My Donations Component (placeholder)
const MyDonations = () => (
  <div className="page-container">
    <h1>My Donations</h1>
    <p>View your donation history and receipts here.</p>
    <div className="coming-soon">
      <h3>🚧 Coming Soon</h3>
      <p>This feature will be available in the next update.</p>
    </div>
  </div>
);

// User Profile Component (placeholder)
const UserProfile = () => (
  <div className="page-container">
    <h1>Profile Settings</h1>
    <p>Manage your account settings and preferences here.</p>
    <div className="coming-soon">
      <h3>🚧 Coming Soon</h3>
      <p>This feature will be available in the next update.</p>
    </div>
  </div>
);

// 404 Not Found Component
const NotFound = () => (
  <div className="page-container">
    <div className="not-found">
      <div className="not-found-icon">🔍</div>
      <h1>Page Not Found</h1>
      <p>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="not-found-actions">
        <a href="/" className="btn btn-primary">
          Go Home
        </a>
        <a href="/campaigns" className="btn btn-outline">
          Browse Campaigns
        </a>
      </div>
    </div>
  </div>
);

export default App;