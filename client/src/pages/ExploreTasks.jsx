import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import PromptModal from '../components/PromptModal';

const CITIES = [
  'All',
  'Ahmedabad',
  'Amritsar',
  'Bengaluru',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Erode',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Madurai',
  'Mumbai',
  'Patna',
  'Pune',
  'Salem',
  'Thanjavur',
  'Tiruchirappalli',
  'Tirunelveli',
  'Varanasi',
  'Vellore',
  'Visakhapatnam'
];

const CATEGORIES = [
  'All',
  'Education',
  'Food distribution',
  'Environment',
  'Elder support',
  'Disaster support',
  'Community service'
];

export default function ExploreTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('all'); // 'all', 'skills', 'location', 'ai'
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [tasks, setTasks] = useState([]);
  const [appliedMap, setAppliedMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [modeMeta, setModeMeta] = useState({});

  // Prompt modal state
  const [selectedTaskForApply, setSelectedTaskForApply] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync category param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== category) {
      setCategory(cat);
    }
  }, [searchParams]);

  // Fetch volunteer applied tasks
  const fetchAppliedTasks = async () => {
    if (isLoggedIn && role === 'volunteer') {
      try {
        const res = await apiRequest('/applications/my-tasks', 'GET');
        if (res.ok && res.data && Array.isArray(res.data.applications)) {
          const map = new Map();
          res.data.applications.forEach((app) => {
            if (app.taskId) {
              const tId = app.taskId._id ? app.taskId._id.toString() : app.taskId.toString();
              map.set(tId, app);
            }
          });
          setAppliedMap(map);
        }
      } catch (e) {
        // non-blocking
      }
    }
  };

  useEffect(() => {
    fetchAppliedTasks();
  }, [isLoggedIn, role]);

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      if (['skills', 'location', 'ai'].includes(mode) && !isLoggedIn) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let endpoint = '/tasks';

      if (mode === 'skills') {
        endpoint = '/tasks/matching/skills';
      } else if (mode === 'location') {
        endpoint = '/tasks/matching/location';
      } else if (mode === 'ai') {
        endpoint = '/tasks/recommendations/ai';
      } else {
        const params = new URLSearchParams();
        if (category !== 'All') params.append('category', category);
        if (city !== 'All') params.append('city', city);
        if (searchTerm) params.append('search', searchTerm);
        endpoint = `/tasks?${params.toString()}`;
      }

      try {
        const res = await apiRequest(endpoint, 'GET');
        if (res.ok && res.data.success) {
          if (mode === 'skills') {
            setTasks(res.data.tasks || []);
          } else if (mode === 'location') {
            setTasks([...(res.data.localTasks || []), ...(res.data.otherTasks || [])]);
            setModeMeta({ volunteerCity: res.data.volunteerCity, localCount: res.data.localCount });
          } else if (mode === 'ai') {
            setTasks(res.data.recommendations || []);
          } else {
            setTasks(res.data.tasks || []);
          }
        } else {
          setTasks([]);
        }
      } catch (e) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [mode, category, city, searchTerm, isLoggedIn]);

  // Client-side filtering when in matching modes
  const filteredTasks = useMemo(() => {
    if (!['skills', 'location', 'ai'].includes(mode)) {
      return tasks;
    }

    let result = tasks;

    if (category !== 'All') {
      result = result.filter((t) => t.category === category);
    }

    if (city !== 'All') {
      result = result.filter((t) => (t.city || '').toLowerCase() === city.toLowerCase());
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((t) => {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const locMatch = (t.location || '').toLowerCase().includes(q);
        const cityMatch = (t.city || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const skillsMatch = (t.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        return titleMatch || descMatch || locMatch || cityMatch || catMatch || skillsMatch;
      });
    }

    return result;
  }, [tasks, mode, category, city, searchTerm]);

  const handleApplyClick = (task) => {
    if (!isLoggedIn) {
      showToast('Please log in as a volunteer to apply for tasks.', 'warning');
      navigate('/login');
      return;
    }

    if (role !== 'volunteer') {
      showToast('Only registered volunteers can apply for tasks.', 'error');
      return;
    }

    setSelectedTaskForApply(task);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (note) => {
    if (!selectedTaskForApply) return;

    try {
      const res = await apiRequest('/applications/apply', 'POST', {
        taskId: selectedTaskForApply._id,
        notes: note.trim()
      });

      if (res.ok && res.data.success) {
        showToast('Application successfully submitted! Marked as [APPLIED].', 'success', 4000);
        setIsApplyModalOpen(false);
        setSelectedTaskForApply(null);
        await fetchAppliedTasks();
      } else {
        showToast(res.data.message || 'Failed to submit application', 'error');
      }
    } catch (e) {
      showToast('Error submitting task application', 'error');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="page-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>
            OPPORTUNITIES DIRECTORY
          </span>
          <h1>Explore Social-Service Tasks</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Browse verified community drives, filter by category or city, or find matching tasks.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`tab-btn mode-tab ${mode === 'all' ? 'active' : ''}`}
              onClick={() => setMode('all')}
            >
              All Opportunities
            </button>
            <button
              type="button"
              className={`tab-btn mode-tab ${mode === 'skills' ? 'active' : ''}`}
              onClick={() => setMode('skills')}
            >
              Skill-Based Match
            </button>
            <button
              type="button"
              className={`tab-btn mode-tab ${mode === 'location' ? 'active' : ''}`}
              onClick={() => setMode('location')}
            >
              Location-Based Match
            </button>
            <button
              type="button"
              className={`tab-btn mode-tab ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => setMode('ai')}
            >
              AI Recommendations
            </button>
          </div>
          <div className="filter-bar">
            <div className="filter-item" style={{ flex: 2 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search tasks by title, description, city, or skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setSearchTerm(searchInput.trim());
                  }
                }}
              />
            </div>

            <div className="filter-item">
              <select
                className="form-control"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSearchParams({ category: e.target.value, city });
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select
                className="form-control"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSearchParams({ category, city: e.target.value });
                }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Cities' : c}
                  </option>
                ))}
              </select>
            </div>

            {(category !== 'All' || city !== 'All' || searchInput) && (
              <button
                type="button"
                onClick={() => {
                  setCategory('All');
                  setCity('All');
                  setSearchInput('');
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.55rem 1rem', whiteSpace: 'nowrap' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Login Required Card for Matching Modes */}
          {['skills', 'location', 'ai'].includes(mode) && !isLoggedIn && (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '2rem' }}>
              <h3>Login Required for Matching</h3>
              <p>Please log in as a registered volunteer to view personalized skill matches and recommendations.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Login Now
              </Link>
            </div>
          )}

          {/* Active Mode Banner */}
          {mode === 'location' && modeMeta.volunteerCity && (
            <div
              className="card"
              style={{
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #059669',
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem'
              }}
            >
              <div style={{ fontWeight: 800, color: '#065f46', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
                LOCATION MATCH ACTIVE FOR: {modeMeta.volunteerCity.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#047857' }}>
                Displaying <strong>{modeMeta.localCount || 0}</strong> drive(s) in your registered city first with{' '}
                <strong>[LOCAL MATCH: {modeMeta.volunteerCity.toUpperCase()}]</strong>, followed by available community
                drives across other cities.
              </div>
            </div>
          )}

          {mode === 'skills' && isLoggedIn && (
            <div
              className="card"
              style={{
                backgroundColor: '#eff6ff',
                border: '1.5px solid #3b82f6',
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem'
              }}
            >
              <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
                SKILL-BASED MATCHING ACTIVE
              </div>
              <div style={{ fontSize: '0.9rem', color: '#1d4ed8' }}>
                Tasks are ranked by matching your volunteer profile skills with task prerequisites.
              </div>
            </div>
          )}

          {mode === 'ai' && isLoggedIn && (
            <div
              className="card"
              style={{
                backgroundColor: '#faf5ff',
                border: '1.5px solid #a855f7',
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem'
              }}
            >
              <div style={{ fontWeight: 800, color: '#6b21a8', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
                AI TASK RECOMMENDATIONS ACTIVE
              </div>
              <div style={{ fontSize: '0.9rem', color: '#7e22ce' }}>
                Personalized ranking combining skills (40 pts), city location (30 pts), previous engagement (20 pts), and
                urgency (10 pts).
              </div>
            </div>
          )}

          {/* Tasks Grid Container */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading opportunities...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ marginBottom: '0.4rem' }}>No Social Service Tasks Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                No community opportunities match your current filter selection. Try adjusting the category, city, or search keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory('All');
                  setCity('All');
                  setSearchInput('');
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="btn btn-primary btn-sm"
              >
                Clear Filters & View All Tasks
              </button>
            </div>
          ) : (
            <div className="grid-3" id="tasks-grid">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onApply={handleApplyClick}
                  appliedApp={appliedMap.get(task._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <PromptModal
        isOpen={isApplyModalOpen}
        title="Confirm Task Application"
        message="Your volunteer profile (name, mobile number, registered city, and skills) will be submitted to the organizing NGO. You can also include an optional note or availability details below:"
        placeholder="e.g., Available on the scheduled date, experienced in tutoring and student mentoring..."
        submitText="Submit Application"
        onCancel={() => {
          setIsApplyModalOpen(false);
          setSelectedTaskForApply(null);
        }}
        onSubmit={handleConfirmApply}
      />
    </div>
  );
}
