import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../api'

function WorkerHistory({ user, onLogout }) {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    setError('')
    
    const result = await bookingAPI.getWorkerAppointments(user.id)
    
    if (result.success) {
      setAppointments(result.data.appointments || [])
    } else {
      setError(result.error)
      setAppointments([])
    }
    
    setLoading(false)
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setLoading(true)
    setMessage('')
    setError('')

    const result = await bookingAPI.updateBookingStatus(appointmentId, user.id, newStatus)

    if (result.success) {
      setMessage(`Appointment ${newStatus.toLowerCase()} successfully!`)
      setTimeout(() => setMessage(''), 3000)
      fetchAppointments() // Refresh list
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

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

  const canAccept = (status) => status === 'Booked'
  const canReject = (status) => status === 'Booked' || status === 'Confirmed'
  const canComplete = (status) => status === 'Confirmed' || status === 'InProgress'

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
          <h1>My Appointments</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'Worker'}!</span>
            <button className="btn btn-secondary" onClick={() => navigate('/worker')} style={{ marginRight: '10px' }}>
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
          <div className="loading">Loading appointments...</div>
        ) : appointments.length > 0 ? (
          <div className="card">
            <h2>Your Appointments ({appointments.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td><strong>{appointment.user_name}</strong></td>
                      <td>{appointment.service_type}</td>
                      <td>{formatDate(appointment.booking_date)}</td>
                      <td>{appointment.time_slot}</td>
                      <td>
                        <span
                          className="worker-badge"
                          style={{
                            background: getStatusColor(appointment.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <a href={`tel:${appointment.user_phone}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                          {appointment.user_phone}
                        </a>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedAppointment(selectedAppointment === appointment.id ? null : appointment.id)}
                          >
                            {selectedAppointment === appointment.id ? 'Hide' : 'Details'}
                          </button>
                          {canAccept(appointment.status) && (
                            <button
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleStatusUpdate(appointment.id, 'Confirmed')}
                              disabled={loading}
                            >
                              Accept
                            </button>
                          )}
                          {canReject(appointment.status) && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to reject this appointment?')) {
                                  handleStatusUpdate(appointment.id, 'Cancelled')
                                }
                              }}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          )}
                          {canComplete(appointment.status) && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleStatusUpdate(appointment.id, 'Completed')}
                              disabled={loading}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Appointment Details */}
            {selectedAppointment && appointments.find(a => a.id === selectedAppointment) && (
              <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                {(() => {
                  const appointment = appointments.find(a => a.id === selectedAppointment)
                  return (
                    <>
                      <h3>Appointment Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div>
                          <strong>User:</strong> {appointment.user_name}
                        </div>
                        <div>
                          <strong>Phone:</strong> <a href={`tel:${appointment.user_phone}`}>{appointment.user_phone}</a>
                        </div>
                        <div>
                          <strong>Service:</strong> {appointment.service_type}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(appointment.booking_date)}
                        </div>
                        <div>
                          <strong>Time:</strong> {appointment.time_slot}
                        </div>
                        <div>
                          <strong>Status:</strong> {appointment.status}
                        </div>
                        {appointment.address && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Address:</strong> {appointment.address}
                          </div>
                        )}
                        {appointment.notes && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        <div style={{ gridColumn: '1 / -1', fontSize: '12px', color: '#666' }}>
                          <strong>Booked on:</strong> {formatDateTime(appointment.created_at)}
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
            <h2>No Appointments Yet</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              You don't have any appointments yet. Make sure your availability is set and status is "Available"!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/worker')} style={{ marginTop: '20px' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerHistory

