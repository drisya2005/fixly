import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { trackingAPI } from '../api'

function WorkerTracking({ user, onLogout }) {
  const navigate = useNavigate()
  const [tracking, setTracking] = useState(false)
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const intervalRef = useRef(null)

  // Keep tracking active in localStorage so it continues even if page closes
  useEffect(() => {
    // Check if tracking was active before page reload
    const wasTracking = localStorage.getItem('workerTracking') === 'true'
    const savedWorkerId = localStorage.getItem('workerTrackingId')

    if (wasTracking && savedWorkerId === String(user.id)) {
      // Resume tracking if it was active
      setTracking(true)
      resumeTracking()
    }

    return () => {
      // Don't stop tracking when unmounting - let it continue in background
      // Only clean up the interval, not the tracking state
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user.id])

  const sendLocation = async (latitude, longitude) => {
    setCoords({ latitude, longitude })
    await trackingAPI.updateLocation(user.id, latitude, longitude)
  }

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
      })
    })
  }

  const resumeTracking = async () => {
    // Resume tracking from localStorage (for page reloads/logout)
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition()
        await sendLocation(pos.coords.latitude, pos.coords.longitude)
      } catch {
        setError('Location update failed. Make sure location access is still allowed.')
      }
    }, 10000)
  }

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError('')

    // Get first location immediately
    try {
      const pos = await getCurrentPosition()
      await sendLocation(pos.coords.latitude, pos.coords.longitude)
      setTracking(true)
      setMessage('Tracking started. Location updates every 10 seconds.')

      // Save tracking state to localStorage so it persists after logout/page close
      localStorage.setItem('workerTracking', 'true')
      localStorage.setItem('workerTrackingId', String(user.id))
    } catch {
      setError('Could not get location. Please allow location access in your browser.')
      return
    }

    // Then update every 10 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition()
        await sendLocation(pos.coords.latitude, pos.coords.longitude)
      } catch {
        setError('Location update failed. Make sure location access is still allowed.')
      }
    }, 10000)
  }

  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTracking(false)
    setCoords(null)
    setMessage('Tracking stopped.')

    // Clear localStorage so tracking doesn't resume
    localStorage.removeItem('workerTracking')
    localStorage.removeItem('workerTrackingId')

    await trackingAPI.stopTracking(user.id)
  }

  const mapUrl = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.01},${coords.latitude - 0.01},${coords.longitude + 0.01},${coords.latitude + 0.01}&layer=mapnik&marker=${coords.latitude},${coords.longitude}`
    : null

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Share My Location</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'Worker'}!</span>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/worker')}
              style={{ marginRight: '10px' }}
            >
              Back to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Live Location Sharing</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            When tracking is active, users can see your real-time location. Location updates every 10 seconds.
          </p>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={startTracking}
              disabled={tracking}
              style={{ flex: 1, padding: '14px' }}
            >
              Start Tracking
            </button>
            <button
              className="btn btn-secondary"
              onClick={stopTracking}
              disabled={!tracking}
              style={{ flex: 1, padding: '14px' }}
            >
              Stop Tracking
            </button>
          </div>

          <div
            style={{
              padding: '15px',
              borderRadius: '8px',
              background: tracking ? '#d4edda' : '#f8f9fa',
              border: `1px solid ${tracking ? '#28a745' : '#dee2e6'}`,
              marginBottom: '20px',
            }}
          >
            <strong style={{ color: tracking ? '#155724' : '#6c757d' }}>
              {tracking ? '● Live tracking is ON' : '○ Tracking is OFF'}
            </strong>
            {tracking && coords && (
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#155724' }}>
                Lat: {coords.latitude.toFixed(6)} &nbsp;|&nbsp; Lng: {coords.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {mapUrl && (
            <div>
              <h3 style={{ marginBottom: '10px' }}>Your Current Location</h3>
              <iframe
                title="Your current location on map"
                width="100%"
                height="320"
                style={{ border: '2px solid #dee2e6', borderRadius: '8px', display: 'block' }}
                src={mapUrl}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                Map powered by OpenStreetMap
              </p>
            </div>
          )}

          <div style={{ marginTop: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px' }}>How it works:</h3>
            <ul style={{ color: '#666', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Click <strong>Start Tracking</strong> — your browser will ask for location permission</li>
              <li>Your GPS coordinates are sent to the server every 10 seconds</li>
              <li>The user who booked you can see your live location on their screen</li>
              <li>Click <strong>Stop Tracking</strong> when you are done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerTracking