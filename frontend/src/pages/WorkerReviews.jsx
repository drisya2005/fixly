import { useNavigate, useSearchParams } from 'react-router-dom'
import ReviewList from './ReviewList'

/**
 * WorkerReviews page — shows all reviews for a specific worker.
 * Accessed via: /worker-reviews?worker_id=X&worker_name=John
 */
function WorkerReviews({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workerId = searchParams.get('worker_id')
  const workerName = searchParams.get('worker_name') || 'Worker'

  if (!workerId) {
    return (
      <div className="container">
        <div className="card">
          <p style={{ color: '#666' }}>No worker specified.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/user')} style={{ marginTop: '10px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Reviews — {workerName}</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name || 'User'}!</span>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              style={{ marginRight: '10px' }}
            >
              Back
            </button>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Customer Reviews</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Honest reviews from users who have used {workerName}'s services.
          </p>
          <ReviewList workerId={workerId} />
        </div>
      </div>
    </div>
  )
}

export default WorkerReviews