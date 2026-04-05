import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pending') // pending, complaints, workers, users
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Pending Workers
  const [pendingWorkers, setPendingWorkers] = useState([])

  // Complaints
  const [complaints, setComplaints] = useState([])
  const [complaintFilter, setComplaintFilter] = useState('all') // all, pending, resolved

  // All Workers
  const [allWorkers, setAllWorkers] = useState([])

  // All Users
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingWorkers()
    } else if (activeTab === 'complaints') {
      fetchComplaints()
    } else if (activeTab === 'workers') {
      fetchAllWorkers()
    } else if (activeTab === 'users') {
      fetchAllUsers()
    }
  }, [activeTab, complaintFilter])

  const fetchPendingWorkers = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await adminAPI.getPendingWorkers()
      console.log('Pending workers result:', result)
      if (result.success) {
        setPendingWorkers(result.data.workers || [])
        if ((result.data.workers || []).length === 0) {
          setError('No pending workers found')
        }
      } else {
        setError(result.error || 'Failed to fetch pending workers')
      }
    } catch (err) {
      console.error('Error fetching pending workers:', err)
      setError('Failed to fetch pending workers. Please check backend connection.')
    }
    setLoading(false)
  }

  const fetchComplaints = async () => {
    setLoading(true)
    setError('')
    try {
      const status = complaintFilter === 'all' ? '' : complaintFilter
      const result = await adminAPI.getComplaints(status)
      console.log('Complaints result:', result)
      if (result.success) {
        setComplaints(result.data.complaints || [])
        if ((result.data.complaints || []).length === 0) {
          setError('No complaints found')
        }
      } else {
        setError(result.error || 'Failed to fetch complaints')
      }
    } catch (err) {
      console.error('Error fetching complaints:', err)
      setError('Failed to fetch complaints. Please check backend connection.')
    }
    setLoading(false)
  }

  const fetchAllWorkers = async () => {
    setLoading(true)
    setError('')
    const result = await adminAPI.getAllWorkers()
    if (result.success) {
      setAllWorkers(result.data.workers || [])
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const fetchAllUsers = async () => {
    setLoading(true)
    setError('')
    const result = await adminAPI.getAllUsers()
    if (result.success) {
      setAllUsers(result.data.users || [])
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleApproveWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to approve this worker?')) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.approveWorker(workerId)
    if (result.success) {
      setMessage('Worker approved successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchPendingWorkers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleRejectWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to reject/block this worker?')) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.rejectWorker(workerId)
    if (result.success) {
      setMessage('Worker rejected/blocked successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchPendingWorkers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleResolveComplaint = async (complaintId) => {
    setLoading(true)
    setMessage('')
    const result = await adminAPI.resolveComplaint(complaintId)
    if (result.success) {
      setMessage('Complaint marked as resolved!')
      setTimeout(() => setMessage(''), 3000)
      fetchComplaints()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleBlockUser = async (userId, currentStatus) => {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block'
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.blockUser(userId, action)
    if (result.success) {
      setMessage(`User ${action}ed successfully!`)
      setTimeout(() => setMessage(''), 3000)
      fetchAllUsers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone!')) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.deleteUser(userId)
    if (result.success) {
      setMessage('User deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchAllUsers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleBlockWorker = async (workerId, currentStatus) => {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block'
    if (!window.confirm(`Are you sure you want to ${action} this worker?`)) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.blockWorker(workerId, action)
    if (result.success) {
      setMessage(`Worker ${action}ed successfully!`)
      setTimeout(() => setMessage(''), 3000)
      fetchAllWorkers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to delete this worker? This action cannot be undone!')) return

    setLoading(true)
    setMessage('')
    const result = await adminAPI.deleteWorker(workerId)
    if (result.success) {
      setMessage('Worker deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchAllWorkers()
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'approved': return '#28a745'
      case 'blocked': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <span className="user-info">Admin Panel</span>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Approvals ({pendingWorkers.length})
            </button>
            <button
              className={`btn ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('complaints')}
            >
              Complaints ({complaints.length})
            </button>
            <button
              className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('workers')}
            >
              Manage Workers
            </button>
            <button
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              Manage Users
            </button>
          </div>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {/* Pending Workers Tab */}
        {activeTab === 'pending' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Pending Worker Approvals</h2>
                <p style={{ color: '#666', marginTop: '5px' }}>
                  Review and approve workers who have registered. Only approved workers will be visible to users.
                </p>
              </div>
              <button className="btn btn-primary" onClick={fetchPendingWorkers} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading pending workers...</div>
            ) : error && error.includes('No pending workers') ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>No pending workers to review</p>
                <p style={{ fontSize: '14px' }}>All workers have been approved or there are no new registrations.</p>
              </div>
            ) : pendingWorkers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No pending workers to review
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Service Type</th>
                      <th>Experience</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWorkers.map((worker) => (
                      <tr key={worker.id}>
                        <td>{worker.id}</td>
                        <td><strong>{worker.name || 'N/A'}</strong></td>
                        <td>{worker.service_type || 'N/A'}</td>
                        <td>{worker.experience || 0} years</td>
                        <td>
                          <div>{worker.area || 'N/A'}</div>
                          <small style={{ color: '#666' }}>Pincode: {worker.pincode || 'N/A'}</small>
                        </td>
                        <td>
                          <div><strong>Phone:</strong> {worker.phone || 'N/A'}</div>
                          <small style={{ color: '#666' }}><strong>Email:</strong> {worker.email || 'N/A'}</small>
                        </td>
                        <td style={{ fontSize: '12px' }}>{formatDate(worker.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                            <button
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
                              onClick={() => handleApproveWorker(worker.id)}
                              disabled={loading}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
                              onClick={() => handleRejectWorker(worker.id)}
                              disabled={loading}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Worker Complaints</h2>
                <p style={{ color: '#666', marginTop: '5px' }}>
                  Review and manage complaints submitted by users against workers.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600' }}>Filter:</label>
                <select
                  value={complaintFilter}
                  onChange={(e) => setComplaintFilter(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
                >
                  <option value="all">All Complaints</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button className="btn btn-primary" onClick={fetchComplaints} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading complaints...</div>
            ) : error && error.includes('No complaints') ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>No complaints found</p>
                <p style={{ fontSize: '14px' }}>There are no complaints to review at this time.</p>
              </div>
            ) : complaints.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No complaints found
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Worker</th>
                      <th>Complaint Message</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td>{complaint.id}</td>
                        <td>
                          <div><strong>{complaint.user_name || 'N/A'}</strong></div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Phone: {complaint.user_phone || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div><strong>{complaint.worker_name || 'N/A'}</strong></div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Worker ID: {complaint.worker_id || 'N/A'}
                          </div>
                        </td>
                        <td style={{ maxWidth: '400px', wordWrap: 'break-word' }}>
                          <div style={{ 
                            padding: '10px', 
                            background: '#f8f9fa', 
                            borderRadius: '6px',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '150px',
                            overflowY: 'auto'
                          }}>
                            {complaint.complaint_text || 'No complaint text'}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          <div>{formatDate(complaint.created_at)}</div>
                          {complaint.resolved_at && (
                            <div style={{ color: '#28a745', marginTop: '5px' }}>
                              Resolved: {formatDate(complaint.resolved_at)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: (complaint.status === 'pending' || complaint.status === 'Open') ? '#ffc107' : '#28a745',
                              color: 'white',
                            }}
                          >
                            {complaint.status === 'Open' ? 'Pending' : complaint.status || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {(complaint.status === 'pending' || complaint.status === 'Open') ? (
                            <button
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleResolveComplaint(complaint.id)}
                              disabled={loading}
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span style={{ color: '#28a745', fontSize: '12px' }}>✓ Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Manage Workers Tab */}
        {activeTab === 'workers' && (
          <div className="card">
            <h2>Manage All Workers</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              View, block, or delete worker accounts.
            </p>

            {loading ? (
              <div className="loading">Loading workers...</div>
            ) : allWorkers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No workers found
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Complaints</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWorkers.map((worker) => (
                      <tr key={worker.id}>
                        <td>{worker.id}</td>
                        <td><strong>{worker.name}</strong></td>
                        <td>{worker.service_type}</td>
                        <td>{worker.area || 'N/A'}, {worker.pincode || 'N/A'}</td>
                        <td>{worker.status}</td>
                        <td>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: getVerificationStatusColor(worker.verification_status),
                              color: 'white',
                            }}
                          >
                            {worker.verification_status}
                          </span>
                        </td>
                        <td>{worker.complaint_count || 0}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <button
                              className={`btn ${worker.verification_status === 'blocked' ? 'btn-success' : 'btn-danger'}`}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleBlockWorker(worker.id, worker.verification_status)}
                              disabled={loading}
                            >
                              {worker.verification_status === 'blocked' ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleDeleteWorker(worker.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <h2>Manage All Users</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              View, block, or delete user accounts.
            </p>

            {loading ? (
              <div className="loading">Loading users...</div>
            ) : allUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No users found
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.phone}</td>
                        <td>{user.area || 'N/A'}, {user.pincode || 'N/A'}</td>
                        <td>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: user.status === 'active' ? '#28a745' : '#dc3545',
                              color: 'white',
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{formatDate(user.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <button
                              className={`btn ${user.status === 'blocked' ? 'btn-success' : 'btn-danger'}`}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleBlockUser(user.id, user.status)}
                              disabled={loading}
                            >
                              {user.status === 'blocked' ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
