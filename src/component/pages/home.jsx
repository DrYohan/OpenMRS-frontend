import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  Database,
} from "lucide-react";
import "../../css/Home.css";

const Home = () => {
  const features = [
    {
      icon: Activity,
      title: "Patient Monitoring",
      description: "Real-time patient health monitoring and tracking",
      color: "#667eea",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Comprehensive user and role management system",
      color: "#764ba2",
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Secure digital medical record management",
      color: "#f093fb",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Advanced analytics and reporting tools",
      color: "#4facfe",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Enterprise-grade security and compliance",
      color: "#43e97b",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your data anytime, anywhere",
      color: "#fa709a",
    },
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Active Users" },
    { icon: Heart, value: "50,000+", label: "Patients Served" },
    { icon: Database, value: "99.9%", label: "Uptime" },
    { icon: Shield, value: "100%", label: "Secure" },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Modern Healthcare
              <span className="gradient-text"> Management System</span>
            </h1>
            <p className="hero-description">
              Streamline your healthcare operations with our comprehensive
              medical records system. Secure, efficient, and designed for modern
              healthcare providers.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">
                Get Started
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link to="/documentation" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <Activity size={24} color="#667eea" />
              <div>
                <p className="card-label">Active Patients</p>
                <p className="card-value">1,234</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <Heart size={24} color="#f093fb" />
              <div>
                <p className="card-label">Health Score</p>
                <p className="card-value">98%</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <TrendingUp size={24} color="#43e97b" />
              <div>
                <p className="card-label">Improvement</p>
                <p className="card-value">+24%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <stat.icon size={32} className="stat-icon" />
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-description">
            Everything you need to manage your healthcare operations efficiently
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div
                className="feature-icon"
                style={{ background: `${feature.color}15` }}
              >
                <feature.icon size={28} color={feature.color} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-description">
            Join thousands of healthcare providers using OpenMRS to deliver
            better patient care.
          </p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
