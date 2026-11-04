import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function Home() {
  const [metrics, setMetrics] = useState({
    totalVolunteers: 37,
    totalNGOs: 27,
    totalTasks: 42,
    totalHoursServed: 240
  });

  useEffect(() => {
    async function fetchImpactStats() {
      try {
        const res = await apiRequest('/dashboard/impact', 'GET');
        if (res.ok && res.data.success && res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      } catch (e) {
        // Fallback to initial values
      }
    }
    fetchImpactStats();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '1.25rem' }}>
            CENTRALIZED SOCIAL SERVICE PLATFORM
          </span>
          <h1 className="hero-title">Connect Volunteers with Community Needs</h1>
          <p className="hero-subtitle">
            Bridging dedicated volunteers with registered NGOs and grassroots social-service initiatives.
            Contribute your skills, complete verified tasks, and track your social impact.
          </p>
          <div className="hero-actions">
            <Link
              to="/explore-tasks"
              className="btn btn-primary"
              style={{
                backgroundColor: '#ffffff',
                color: '#064e3b',
                borderColor: '#ffffff',
                fontWeight: 800,
                padding: '0.85rem 1.85rem',
                fontSize: '1.05rem'
              }}
            >
              Find Opportunities
            </Link>
            <Link
              to="/register"
              className="btn btn-outline"
              style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                borderColor: '#34d399',
                fontWeight: 800,
                padding: '0.85rem 1.85rem',
                fontSize: '1.05rem'
              }}
            >
              Register as NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Key Statistics Banner */}
      <section style={{ padding: '2.75rem 0', backgroundColor: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)' }}>
        <div className="container">
          <div className="grid-4">
            <div className="stat-box">
              <div className="stat-label">Verified Volunteers</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {metrics.totalVolunteers}+
              </div>
              <div className="stat-meta">Active community participants</div>
            </div>
            <div className="stat-box stat-blue">
              <div className="stat-label">Partner NGOs</div>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                {metrics.totalNGOs}+
              </div>
              <div className="stat-meta">Registered social enterprises</div>
            </div>
            <div className="stat-box stat-amber">
              <div className="stat-label">Tasks Published</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {metrics.totalTasks}+
              </div>
              <div className="stat-meta">Across 6 core categories</div>
            </div>
            <div className="stat-box stat-purple">
              <div className="stat-label">Hours Contributed</div>
              <div className="stat-value" style={{ color: '#7e22ce' }}>
                {metrics.totalHoursServed}+
              </div>
              <div className="stat-meta">Logged community service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Categories Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>
              AREAS OF ENGAGEMENT
            </span>
            <h2>Explore By Task Category</h2>
            <p>Choose an initiative aligned with your skills, availability, and community passion.</p>
          </div>

          <div className="grid-3">
            {/* 1. Education */}
            <div className="card" style={{ borderTop: '4px solid #1d4ed8' }}>
              <span className="badge badge-cat-education" style={{ marginBottom: '0.75rem' }}>
                EDUCATION
              </span>
              <h3>Education & Tutoring</h3>
              <p>Support remedial tutoring, digital literacy, and basic language skills for underprivileged children and students.</p>
              <Link
                to="/explore-tasks?category=Education"
                className="btn btn-outline btn-sm"
                style={{ color: '#1d4ed8', borderColor: '#1d4ed8' }}
              >
                Browse Education Tasks
              </Link>
            </div>

            {/* 2. Food Distribution */}
            <div className="card" style={{ borderTop: '4px solid #c2410c' }}>
              <span className="badge badge-cat-food" style={{ marginBottom: '0.75rem' }}>
                FOOD DISTRIBUTION
              </span>
              <h3>Food Distribution</h3>
              <p>Assist in surplus food rescue, food packaging, and distribution drives to shelters and disadvantaged communities.</p>
              <Link
                to="/explore-tasks?category=Food%20distribution"
                className="btn btn-outline btn-sm"
                style={{ color: '#c2410c', borderColor: '#c2410c' }}
              >
                Browse Food Drives
              </Link>
            </div>

            {/* 3. Environment */}
            <div className="card" style={{ borderTop: '4px solid #047857' }}>
              <span className="badge badge-cat-environment" style={{ marginBottom: '0.75rem' }}>
                ENVIRONMENT
              </span>
              <h3>Environment & Ecology</h3>
              <p>Participate in urban afforestation, neighborhood clean-ups, lake rejuvenation, and waste management drives.</p>
              <Link
                to="/explore-tasks?category=Environment"
                className="btn btn-outline btn-sm"
                style={{ color: '#047857', borderColor: '#047857' }}
              >
                Browse Eco Drives
              </Link>
            </div>

            {/* 4. Elder Support */}
            <div className="card" style={{ borderTop: '4px solid #7e22ce' }}>
              <span className="badge badge-cat-elder" style={{ marginBottom: '0.75rem' }}>
                ELDER SUPPORT
              </span>
              <h3>Elder Support & Care</h3>
              <p>Provide digital assistance, companionship, and healthcare access support for residents in senior care homes.</p>
              <Link
                to="/explore-tasks?category=Elder%20support"
                className="btn btn-outline btn-sm"
                style={{ color: '#7e22ce', borderColor: '#7e22ce' }}
              >
                Browse Elder Care
              </Link>
            </div>

            {/* 5. Disaster Support */}
            <div className="card" style={{ borderTop: '4px solid #b91c1c' }}>
              <span className="badge badge-cat-disaster" style={{ marginBottom: '0.75rem' }}>
                DISASTER SUPPORT
              </span>
              <h3>Disaster & Emergency Aid</h3>
              <p>Mobilize for rapid relief kit packaging, emergency supply logistics, and seasonal relief coordination.</p>
              <Link
                to="/explore-tasks?category=Disaster%20support"
                className="btn btn-outline btn-sm"
                style={{ color: '#b91c1c', borderColor: '#b91c1c' }}
              >
                Browse Relief Tasks
              </Link>
            </div>

            {/* 6. Community Service */}
            <div className="card" style={{ borderTop: '4px solid #0f766e' }}>
              <span className="badge badge-cat-community" style={{ marginBottom: '0.75rem' }}>
                COMMUNITY SERVICE
              </span>
              <h3>Community Service</h3>
              <p>Engage in stray animal welfare, local civic campaigns, blood donation drives, and public awareness camps.</p>
              <Link
                to="/explore-tasks?category=Community%20service"
                className="btn btn-outline btn-sm"
                style={{ color: '#0f766e', borderColor: '#0f766e' }}
              >
                Browse Community Tasks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          padding: '4rem 0',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '2px solid var(--border-color)',
          borderBottom: '2px solid var(--border-color)'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>
              PLATFORM WORKFLOW
            </span>
            <h2>How Community Hub Works</h2>
            <p>A transparent, structured process for volunteers and organizations.</p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                STEP 1
              </div>
              <h3>Register & Create Profile</h3>
              <p>Volunteers register with their skills and location. NGOs register with their organization details and registration number.</p>
            </div>

            <div className="card" style={{ borderLeft: '5px solid var(--secondary)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.4rem' }}>
                STEP 2
              </div>
              <h3>Publish & Discover Tasks</h3>
              <p>NGOs publish social-service tasks. Volunteers explore opportunities using smart skill matching and location proximity.</p>
            </div>

            <div className="card" style={{ borderLeft: '5px solid var(--accent)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.4rem' }}>
                STEP 3
              </div>
              <h3>Complete & Get Certified</h3>
              <p>After assignment and task completion, volunteers earn ranking points and receive downloadable, verified PDF certificates.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
