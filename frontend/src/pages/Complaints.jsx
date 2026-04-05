import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerAPI, complaintsAPI } from '../api'

function Complaints({ user, onLogout }) {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [complaintText, setComplaintText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    setLoading(true)
    const result = await workerAPI.getAllWorkers()
    if (result.success && result.data.workers) {
      setWorkers(result.data.workers)
    } else {
      setError('Failed to load workers. Please try again.')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedWorker) {
      setError('Please select a worker')
      return
    }

    const wordCount = complaintText.trim().split(/\s+/).filter(Boolean).length
    if (!complaintText.trim() || wordCount < 5 || wordCount > 150) {
      setError(`Complaint must be between 5 and 150 words (currently ${wordCount} word${wordCount === 1 ? '' : 's'})`)
      return
    }

    setLoading(true)

    const result = await complaintsAPI.submitComplaint(
      user.id,
      selectedWorker,
      complaintText.trim()
    )

    if (result.success) {
      setSuccess('Complaint submitted successfully! Admin will review it.')
      setComplaintText('')
      setSelectedWorker('')
      setTimeout(() => {
        navigate('/user')
      }, 2000)
    } else {
      setError(result.error || 'Failed to submit complaint')
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Submit a Complaint</h1>
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
        <div className="card">
          <h2>File a Complaint Against a Worker</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            If you had a negative experience with a worker, please submit a complaint. 
            Our admin team will review it and take appropriate action.
          </p>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="worker">Select Worker *</label>
              {loading && workers.length === 0 ? (
                <div className="loading">Loading workers...</div>
              ) : (
                <select
                  id="worker"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', width: '100%' }}
                  required
                >
                  <option value="">-- Select a worker --</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.service_type} ({worker.area || 'N/A'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="complaint">Complaint Details *</label>
              <textarea
                id="complaint"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Please describe your complaint in detail (minimum 150 words)..."
                rows="6"
                style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', width: '100%', fontFamily: 'inherit' }}
                required
              />
              {(() => {
                const wc = complaintText.trim() ? complaintText.trim().split(/\s+/).filter(Boolean).length : 0
                const isValid = wc >= 5 && wc <= 150
                return (
                  <small style={{ color: isValid ? '#28a745' : '#666', marginTop: '5px', display: 'block' }}>
                    {wc} / 150 words {isValid ? '✓ Valid' : wc < 5 ? '(minimum 5 required)' : '(maximum 150 allowed)'}
                  </small>
                )
              })()}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedWorker || complaintText.trim().split(/\s+/).filter(Boolean).length < 5 || complaintText.trim().split(/\s+/).filter(Boolean).length > 150}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px' }}>Important Notes:</h3>
            <ul style={{ color: '#666', paddingLeft: '20px' }}>
              <li>Complaints are reviewed by admin within 24-48 hours</li>
              <li>Please provide accurate and detailed information</li>
              <li>False complaints may result in account suspension</li>
              <li>You will be notified once your complaint is reviewed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Complaints

