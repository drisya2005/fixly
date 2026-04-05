import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerAPI, emergencyAPI } from '../api'

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [serviceType, setServiceType] = useState('Plumber')
  const [pincode, setPincode] = useState('')
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Emergency state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyServiceType, setEmergencyServiceType] = useState('')
  const [emergencyLoading, setEmergencyLoading] = useState(false)
  const [emergencyWorkers, setEmergencyWorkers] = useState([])
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [emergencyError, setEmergencyError] = useState('')

  const serviceTypes = ['Plumber', 'Electrician', 'Cleaner', 'Carpenter', 'Painter']

  const searchWorkers = async () => {
    setLoading(true)
    setError('')
    
    const result = await workerAPI.searchWorkers(serviceType, pincode)
    
    if (result.success) {
      setWorkers(result.data.workers || [])
      if (result.data.workers.length === 0) {
        setError('No available workers found for this service and location.')
      }
    } else {
      setError(result.error)
      setWorkers([])
    }
    
    setLoading(false)
  }

  // Don't search on page load - wait for user to enter pincode and click search
  useEffect(() => {
    // Empty - no automatic search
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!pincode.trim()) {
      setError('Please enter your pincode to search for workers')
      setWorkers([])
      return
    }
    searchWorkers()
  }

  const openEmergencyModal = () => {
    setShowEmergencyModal(true)
    setEmergencyWorkers([])
    setEmergencyMessage('')
    setEmergencyError('')
    setEmergencyServiceType('')
  }

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false)
    setEmergencyWorkers([])
    setEmergencyMessage('')
    setEmergencyError('')
  }

  const handleSendEmergency = async () => {
    setEmergencyLoading(true)
    setEmergencyError('')
    setEmergencyMessage('')
    setEmergencyWorkers([])

    // Get user's GPS location
    if (!navigator.geolocation) {
      setEmergencyError('Geolocation is not supported by your browser.')
      setEmergencyLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const result = await emergencyAPI.sendEmergency(
          user.id,
          user.name || 'User',
          latitude,
          longitude,
          emergencyServiceType
        )

        if (result.success) {
          setEmergencyWorkers(result.data.workers || [])
          setEmergencyMessage(result.data.message)
        } else {
          setEmergencyError(result.error || 'Failed to send emergency alert.')
        }
        setEmergencyLoading(false)
      },
      (error) => {
        setEmergencyError('Could not get your location. Please allow location access in your browser.')
        setEmergencyLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'User'}!</span>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/user/history')}
              style={{ marginRight: '10px' }}
            >
              View Booking History
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/complaints')}
              style={{ marginRight: '10px' }}
            >
              Submit Complaint
            </button>
            <button
              onClick={openEmergencyModal}
              style={{
                marginRight: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                animation: 'emergencyPulse 1.5s infinite',
              }}
            >
              EMERGENCY
            </button>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEmergencyModal() }}
        >
          <div
            style={{
              background: 'white', borderRadius: '12px', padding: '30px',
              width: '90%', maxWidth: '550px', maxHeight: '80vh', overflowY: 'auto',
              border: '3px solid #dc3545',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#dc3545', margin: 0 }}>EMERGENCY REQUEST</h2>
              <button
                onClick={closeEmergencyModal}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}
              >
                X
              </button>
            </div>

            <p style={{ color: '#555', marginBottom: '20px' }}>
              This will instantly alert available workers within <strong>5km radius</strong> using your GPS location and show you who can help. Workers with active location tracking will be prioritized. <strong>Allow location access</strong> when your browser asks.
            </p>

            {emergencyWorkers.length === 0 && (
              <>
                <div className="input-group">
                  <label>Service Type (optional)</label>
                  <select
                    value={emergencyServiceType}
                    onChange={(e) => setEmergencyServiceType(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                  >
                    <option value="">Any / Not sure</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {emergencyError && <div className="error">{emergencyError}</div>}

                <button
                  onClick={handleSendEmergency}
                  disabled={emergencyLoading}
                  style={{
                    width: '100%', background: '#dc3545', color: 'white', border: 'none',
                    padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '16px',
                    cursor: emergencyLoading ? 'not-allowed' : 'pointer', marginTop: '10px',
                    opacity: emergencyLoading ? 0.7 : 1,
                  }}
                >
                  {emergencyLoading ? 'Sending Alert...' : 'Send Emergency Alert'}
                </button>
              </>
            )}

            {emergencyMessage && (
              <div className="success" style={{ marginTop: '15px' }}>
                {emergencyMessage}
              </div>
            )}

            {emergencyWorkers.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>
                  Nearby Available Workers ({emergencyWorkers.length})
                </h3>
                {emergencyWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    style={{
                      background: '#fff5f5', border: '2px solid #dc3545',
                      borderRadius: '8px', padding: '15px', marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '16px' }}>{worker.name}</strong>
                      <span style={{ background: '#dc3545', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                        NOTIFIED
                      </span>
                    </div>
                    <div style={{ color: '#555', fontSize: '14px' }}>
                      <span><strong>Service:</strong> {worker.service_type}</span>
                      <span style={{ marginLeft: '15px' }}><strong>Area:</strong> {worker.area || 'N/A'}</span>
                      {worker.distance_km && (
                        <span style={{ marginLeft: '15px', background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          📍 {worker.distance_km} km away
                        </span>
                      )}
                      {worker.avg_rating > 0 && (
                        <span style={{ marginLeft: '15px' }}><strong>Rating:</strong> {parseFloat(worker.avg_rating).toFixed(1)}/5</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={() => { closeEmergencyModal(); navigate('/book-appointment', { state: { worker } }) }}
                    >
                      Book This Worker
                    </button>
                  </div>
                ))}
              </div>
            )}

            {emergencyMessage && emergencyWorkers.length === 0 && (
              <button
                onClick={closeEmergencyModal}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '15px' }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes emergencyPulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>

      <div className="container">
        <div className="card">
          <h2>Search for Service Workers</h2>
          
          <form onSubmit={handleSearch} className="search-bar">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter pincode (e.g., 560001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}
        </div>

        {loading ? (
          <div className="loading">Loading workers...</div>
        ) : workers.length > 0 ? (
          <div>
            {(() => {
              const availableWorkers = workers.filter(w => w.status === 'Available')
              const busyWorkers = workers.filter(w => w.status === 'Busy')
              
              return (
                <>
                  {availableWorkers.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ marginBottom: '20px', color: '#333' }}>
                        ✅ Available Workers ({availableWorkers.length})
                      </h2>
                      <div className="worker-grid">
                        {availableWorkers.map((worker) => (
                          <div key={worker.id} className="worker-card">
                            <h3>
                              {worker.name}
                              {worker.tag === 'New' && (
                                <span className="worker-badge badge-new">NEW</span>
                              )}
                            </h3>
                            <div className="worker-info">
                              <strong>Service:</strong> {worker.service_type}
                            </div>
                            <div className="worker-info">
                              <strong>Location:</strong> {worker.area || 'N/A'}, {worker.pincode}
                            </div>
                            <div className="worker-info">
                              <strong>Status:</strong>{' '}
                              <span className={`worker-badge badge-${worker.status.toLowerCase()}`}>
                                {worker.status}
                              </span>
                            </div>
                            <div className="worker-info">
                              <strong>Rating:</strong>{' '}
                              <span className="rating">
                                {worker.avg_rating && parseFloat(worker.avg_rating) > 0
                                  ? `⭐ ${parseFloat(worker.avg_rating).toFixed(1)}/5.0`
                                  : 'No ratings yet'}
                              </span>
                            </div>
                            <button
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '15px' }}
                              onClick={() => navigate('/book-appointment', { state: { worker } })}
                            >
                              Book Appointment
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {busyWorkers.length > 0 && (
                    <div>
                      <h2 style={{ marginBottom: '20px', color: '#333' }}>
                        ⚠️ Currently Engaged Workers ({busyWorkers.length})
                      </h2>
                      <p style={{ color: '#666', marginBottom: '15px' }}>
                        These workers are currently busy but may become available soon.
                      </p>
                      <div className="worker-grid">
                        {busyWorkers.map((worker) => (
                          <div key={worker.id} className="worker-card" style={{ opacity: 0.8 }}>
                            <h3>
                              {worker.name}
                              {worker.tag === 'New' && (
                                <span className="worker-badge badge-new">NEW</span>
                              )}
                            </h3>
                            <div className="worker-info">
                              <strong>Service:</strong> {worker.service_type}
                            </div>
                            <div className="worker-info">
                              <strong>Location:</strong> {worker.area || 'N/A'}, {worker.pincode}
                            </div>
                            <div className="worker-info">
                              <strong>Status:</strong>{' '}
                              <span className={`worker-badge badge-${worker.status.toLowerCase()}`}>
                                {worker.status}
                              </span>
                            </div>
                            <div className="worker-info">
                              <strong>Rating:</strong>{' '}
                              <span className="rating">
                                {worker.avg_rating && parseFloat(worker.avg_rating) > 0
                                  ? `⭐ ${parseFloat(worker.avg_rating).toFixed(1)}/5.0`
                                  : 'No ratings yet'}
                              </span>
                            </div>
                            <div style={{ marginTop: '10px', color: '#ffc107', fontWeight: '600', padding: '10px', background: '#fff3cd', borderRadius: '6px' }}>
                              ⚠️ Worker currently engaged
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default UserDashboard

