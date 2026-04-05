import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerAPI, bookingAPI } from '../api'

function WorkerDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Available')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Availability management
  const [availability, setAvailability] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  
  // Notifications
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const statuses = ['Available', 'Busy', 'Offline']

  // System-defined fixed time slots — workers cannot add custom ones
  const FIXED_SLOTS = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
  ]

  // Fetch availability and notifications on mount
  useEffect(() => {
    fetchAvailability()
    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const fetchAvailability = async () => {
    setLoadingAvailability(true)
    const result = await bookingAPI.getWorkerAvailability(user.id)
    if (result.success) {
      setAvailability(result.data.availability || [])
    }
    setLoadingAvailability(false)
  }

  // Toggle a fixed slot: add if not active, remove if already active
  const handleToggleSlot = async (slotLabel) => {
    const existing = availability.find(
      (s) => s.time_slot === slotLabel && (s.is_active === 1 || s.is_active === true)
    )

    setLoading(true)
    if (existing) {
      const result = await bookingAPI.deleteWorkerAvailability(existing.id, user.id)
      if (result.success) {
        setMessage('Time slot removed.')
        fetchAvailability()
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } else {
      const result = await bookingAPI.setWorkerAvailability({
        worker_id: user.id,
        time_slot: slotLabel,
      })
      if (result.success) {
        setMessage('Time slot added!')
        fetchAvailability()
      } else {
        setMessage(`Error: ${result.error}`)
      }
    }
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
  }

  const fetchNotifications = async () => {
    const result = await bookingAPI.getWorkerNotifications(user.id, true) // Only unread
    if (result.success) {
      setNotifications(result.data.notifications || [])
      setUnreadCount(result.data.notifications?.length || 0)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    const result = await bookingAPI.markNotificationRead(notificationId, user.id)
    if (result.success) {
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    const result = await bookingAPI.markAllNotificationsRead(user.id)
    if (result.success) {
      fetchNotifications()
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true)
    setMessage('')
    
    const result = await workerAPI.updateStatus(user.id, newStatus)
    
    if (result.success) {
      setStatus(newStatus)
      setMessage('Status updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(`Error: ${result.error}`)
    }
    
    setLoading(false)
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Worker Dashboard</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'Worker'}!</span>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/worker/history')}
              style={{ marginRight: '10px' }}
            >
              View Appointments
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/worker/tracking')}
              style={{ marginRight: '10px' }}
            >
              Share Location
            </button>
            <div className="notification-container" style={{ position: 'relative', marginRight: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative' }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  className="notification-container"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '300px',
                    maxWidth: '400px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Notifications</strong>
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={handleMarkAllRead}
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <div>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '15px',
                            borderBottom: '1px solid #f0f0f0',
                            background: notif.is_read === 0 ? '#e7f3ff' : 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onClick={() => handleMarkAsRead(notif.id)}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#d4edda'}
                          onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read === 0 ? '#e7f3ff' : 'white'}
                        >
                          <div style={{ fontSize: '14px', marginBottom: '5px', fontWeight: notif.is_read === 0 ? '600' : '400' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(notif.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No new notifications
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Update Your Status</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Change your availability status so users can find you when you're available.
          </p>

          <div className="status-selector">
            {statuses.map((s) => (
              <button
                key={s}
                className={`status-btn ${status === s ? 'active' : ''}`}
                onClick={() => handleStatusUpdate(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          {message && (
            <div className={message.includes('Error') ? 'error' : 'success'}>
              {message}
            </div>
          )}

          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px' }}>Status Guide:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <strong>Available:</strong> Users can see and book you
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Busy:</strong> You're currently working, won't appear in search
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Offline:</strong> You're not available, won't appear in search
              </li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h2>Manage Your Availability</h2>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            Click a slot to mark yourself as available. Click again to remove it.
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
            Green = you are available &nbsp;|&nbsp; Grey = not available
          </p>

          {loadingAvailability ? (
            <div className="loading">Loading availability...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {FIXED_SLOTS.map((slotLabel) => {
                const isActive = availability.some(
                  (s) => s.time_slot === slotLabel && (s.is_active === 1 || s.is_active === true)
                )
                return (
                  <button
                    key={slotLabel}
                    type="button"
                    onClick={() => handleToggleSlot(slotLabel)}
                    disabled={loading}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? '#28a745' : '#dee2e6'}`,
                      background: isActive ? '#d4edda' : '#f8f9fa',
                      color: isActive ? '#155724' : '#6c757d',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.15s',
                    }}
                  >
                    {slotLabel}
                    <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: '400' }}>
                      {isActive ? '✓ Available' : 'Click to enable'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Your Information</h2>
          <div style={{ color: '#666' }}>
            <p><strong>Worker ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Current Status:</strong> {status}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard

