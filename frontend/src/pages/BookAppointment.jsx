import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { bookingAPI } from '../api'

function BookAppointment() {
  const navigate = useNavigate()
  const location = useLocation()
  const worker = location.state?.worker // Worker data passed from UserDashboard
  
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && worker?.id) {
      fetchAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot('')
    }
  }, [selectedDate, worker?.id])

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !worker?.id) return

    setLoadingSlots(true)
    setError('')
    setSelectedSlot('')

    const result = await bookingAPI.getWorkerSlots(worker.id, selectedDate)

    if (result.success) {
      setAvailableSlots(result.data.available_slots || [])
      if (result.data.available_slots.length === 0) {
        setError('No available slots for this date. Please select another date.')
      }
    } else {
      setError(result.error || 'Failed to fetch available slots')
      setAvailableSlots([])
    }

    setLoadingSlots(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot')
      return
    }

    if (address.trim()) {
      const addr = address.trim()
      if (addr.length < 10) {
        setError('Service address must be at least 10 characters')
        return
      }
      if (addr.length > 200) {
        setError('Service address must be under 200 characters')
        return
      }
      if (!/[a-zA-Z]/.test(addr)) {
        setError('Service address must contain at least one letter')
        return
      }
      if (!/\d/.test(addr)) {
        setError('Service address must contain a house/building number')
        return
      }
    }

    if (!user.id) {
      setError('User not found. Please login again.')
      return
    }

    setLoading(true)

    const bookingData = {
      user_id: user.id,
      worker_id: worker.id,
      booking_date: selectedDate,
      time_slot: selectedSlot,
      service_type: worker.service_type,
      address: address || undefined,
      notes: notes || undefined,
    }

    const result = await bookingAPI.bookAppointment(bookingData)

    if (result.success) {
      setSuccess('Appointment booked successfully! Redirecting...')
      setTimeout(() => {
        navigate('/user')
      }, 2000)
    } else {
      setError(result.error || 'Failed to book appointment')
    }

    setLoading(false)
  }

  if (!worker) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Worker Not Found</h2>
          <p>Please select a worker from the dashboard.</p>
          <button className="btn btn-primary" onClick={() => navigate('/user')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Book Appointment</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/user')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Book Service with {worker.name}</h2>
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <p><strong>Service Type:</strong> {worker.service_type}</p>
            <p><strong>Location:</strong> {worker.area || 'N/A'}, {worker.pincode}</p>
            <p><strong>Rating:</strong> {worker.avg_rating && parseFloat(worker.avg_rating) > 0 
              ? `⭐ ${parseFloat(worker.avg_rating).toFixed(1)}/5.0` 
              : 'No ratings yet'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Select Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                required
              />
            </div>

            {selectedDate && (
              <div className="input-group">
                <label>Available Time Slots *</label>
                {loadingSlots ? (
                  <div className="loading">Loading available slots...</div>
                ) : availableSlots.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.time_slot)}
                        className={`btn ${selectedSlot === slot.time_slot ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '12px', textAlign: 'center' }}
                      >
                        {slot.time_slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>No available slots for this date.</p>
                )}
              </div>
            )}

            <div className="input-group">
              <label>Service Address (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter service address"
              />
            </div>

            <div className="input-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                rows="3"
                style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontFamily: 'inherit' }}
              />
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              disabled={loading || !selectedDate || !selectedSlot}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment

