import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../api'
import ReviewForm from './ReviewForm'

function UserHistory({ user, onLogout }) {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [reviewModal, setReviewModal] = useState(null) // booking being reviewed

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    
    const result = await bookingAPI.getUserBookings(user.id)
    
    if (result.success) {
      setBookings(result.data.bookings || [])
    } else {
      setError(result.error)
      setBookings([])
    }
    
    setLoading(false)
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    const result = await bookingAPI.cancelBooking(bookingId, user.id)

    if (result.success) {
      setMessage('Booking cancelled successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchBookings() // Refresh list
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const openReviewModal = (booking) => setReviewModal(booking)

  const closeReviewModal = () => setReviewModal(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return '#17a2b8'
      case 'Confirmed': return '#28a745'
      case 'InProgress': return '#ffc107'
      case 'Completed': return '#6c757d'
      case 'Cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const canCancel = (status, bookingDate) => {
    if (status === 'Cancelled' || status === 'Completed') return false
    // Can cancel if booking is in the future
    const today = new Date().toISOString().split('T')[0]
    return bookingDate >= today
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>My Booking History</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'User'}!</span>
            <button className="btn btn-secondary" onClick={() => navigate('/user')} style={{ marginRight: '10px' }}>
              Back to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : bookings.length > 0 ? (
          <div className="card">
            <h2>Your Bookings ({bookings.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Service Type</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.worker_name}</strong></td>
                      <td>{booking.service_type}</td>
                      <td>{formatDate(booking.booking_date)}</td>
                      <td>{booking.time_slot}</td>
                      <td>
                        <span
                          className="worker-badge"
                          style={{
                            background: getStatusColor(booking.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#666' }}>
                        {formatDateTime(booking.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                          >
                            {selectedBooking === booking.id ? 'Hide' : 'Details'}
                          </button>
                          {canCancel(booking.status, booking.booking_date) && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleCancel(booking.id)}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === 'Completed' && !booking.has_review && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => openReviewModal(booking)}
                            >
                              Write Review
                            </button>
                          )}
                          {booking.status === 'Completed' && booking.has_review > 0 && (
                            <span style={{ fontSize: '12px', color: '#28a745', fontWeight: '600' }}>
                              Reviewed
                            </span>
                          )}
                          {(booking.status === 'Confirmed' || booking.status === 'InProgress') && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => navigate(`/track-worker?worker_id=${booking.worker_id}&worker_name=${booking.worker_name}`)}
                            >
                              Track Worker
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Booking Details */}
            {selectedBooking && bookings.find(b => b.id === selectedBooking) && (
              <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                {(() => {
                  const booking = bookings.find(b => b.id === selectedBooking)
                  return (
                    <>
                      <h3>Booking Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div>
                          <strong>Worker:</strong> {booking.worker_name}
                        </div>
                        <div>
                          <strong>Phone:</strong> {booking.worker_phone || 'N/A'}
                        </div>
                        <div>
                          <strong>Service:</strong> {booking.service_type}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(booking.booking_date)}
                        </div>
                        <div>
                          <strong>Time:</strong> {booking.time_slot}
                        </div>
                        <div>
                          <strong>Status:</strong> {booking.status}
                        </div>
                        {booking.address && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Address:</strong> {booking.address}
                          </div>
                        )}
                        {booking.notes && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                        <div style={{ gridColumn: '1 / -1', fontSize: '12px', color: '#666' }}>
                          <strong>Booked on:</strong> {formatDateTime(booking.created_at)}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <h2>No Bookings Yet</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              You haven't made any bookings yet. Start by searching for workers and booking an appointment!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/user')} style={{ marginTop: '20px' }}>
              Search Workers
            </button>
          </div>
        )}
      </div>

      {reviewModal && (
        <ReviewForm
          booking={reviewModal}
          user={user}
          onClose={closeReviewModal}
          onSuccess={() => {
            setMessage('Review submitted successfully!')
            setTimeout(() => setMessage(''), 3000)
            closeReviewModal()
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}

export default UserHistory