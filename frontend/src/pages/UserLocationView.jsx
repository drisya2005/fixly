import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { userLocationAPI } from '../api'

function UserLocationView({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id')
  const userName = searchParams.get('user_name') || 'User'

  const [userLocation, setUserLocation] = useState(null)
  const [workerLocation, setWorkerLocation] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      setError('No user specified. Go back and try again.')
      setLoading(false)
      return
    }

    // Try to get worker's own location (optional — just for display)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setWorkerLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {} // silently ignore if worker denies location
      )
    }

    // Fetch user location immediately, then every 10 seconds
    fetchUserLocation()
    intervalRef.current = setInterval(fetchUserLocation, 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [userId])

  const fetchUserLocation = async () => {
    const result = await userLocationAPI.getUserLocation(userId)
    if (result.success) {
      setUserLocation(result.data)
      setLastUpdated(new Date().toLocaleTimeString())
      setError('')
    } else {
      setError('User location not available. The user may not have started sharing their location yet.')
    }
    setLoading(false)
  }

  const getMapUrl = () => {
    if (!userLocation) return null
    const { latitude, longitude } = userLocation
    return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>User Location</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'Worker'}!</span>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/worker/history')}
              style={{ marginRight: '10px' }}
            >
              Back to Appointments
            </button>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Live Location — {userName}</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            This page refreshes the user's location every 10 seconds automatically.
            {lastUpdated && (
              <span> Last updated: <strong>{lastUpdated}</strong></span>
            )}
          </p>

          {loading && <div className="loading">Fetching location...</div>}
          {error && <div className="error">{error}</div>}

          {userLocation && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: workerLocation ? '1fr 1fr' : '1fr',
                  gap: '15px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    padding: '15px',
                    background: '#e7f3ff',
                    borderRadius: '8px',
                    border: '1px solid #007bff',
                  }}
                >
                  <strong style={{ color: '#004085' }}>📍 User Location</strong>
                  <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#004085' }}>
                    Lat: {userLocation.latitude.toFixed(6)}<br />
                    Lng: {userLocation.longitude.toFixed(6)}
                  </p>
                  {userLocation.updated_at && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                      User sent at: {new Date(userLocation.updated_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {workerLocation && (
                  <div
                    style={{
                      padding: '15px',
                      background: '#fff3cd',
                      borderRadius: '8px',
                      border: '1px solid #ffc107',
                    }}
                  >
                    <strong style={{ color: '#856404' }}>📍 Your Location</strong>
                    <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#856404' }}>
                      Lat: {workerLocation.latitude.toFixed(6)}<br />
                      Lng: {workerLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              <iframe
                title="User location on map"
                width="100%"
                height="380"
                style={{ border: '2px solid #dee2e6', borderRadius: '8px', display: 'block' }}
                src={getMapUrl()}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                Blue pin = User's current location &nbsp;|&nbsp; Map powered by OpenStreetMap
              </p>
            </>
          )}

          {!loading && !error && !userLocation && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
              Waiting for user to start sharing their location...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserLocationView