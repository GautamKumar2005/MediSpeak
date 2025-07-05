import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>🏥 Medical History App</h1>
          <p>AI-powered medical document analysis and secure health record management</p>
        </div>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">🔐</div>
            <h3 className="card-title">Secure Login</h3>
            <p className="card-description">
              Sign in securely with your Google account to access your medical records
            </p>
            <Link to="/login" className="card-button">
              Get Started
            </Link>
          </div>
          
          <div className="dashboard-card">
            <div className="card-icon">🤖</div>
            <h3 className="card-title">AI Analysis</h3>
            <p className="card-description">
              Upload medical documents and get instant AI-powered analysis and insights
            </p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3 className="card-title">Health Tracking</h3>
            <p className="card-description">
              Track your health parameters over time with visual charts and trends
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Manage your medical records and get AI-powered health insights</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3 className="card-title">Upload Document</h3>
          <p className="card-description">
            Upload medical reports, lab results, or prescriptions for AI analysis
          </p>
          <Link to="/upload" className="card-button">
            Upload Now
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3 className="card-title">Medical History</h3>
          <p className="card-description">
            View and manage your complete medical history and records
          </p>
          <Link to="/history" className="card-button">
            View History
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📈</div>
          <h3 className="card-title">Health Insights</h3>
          <p className="card-description">
            Get personalized health recommendations based on your medical data
          </p>
          <button className="card-button" disabled>
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
