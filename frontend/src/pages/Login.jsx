import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('user') // 'user', 'worker', 'admin'
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const validate = () => {
    if (activeTab === 'admin') {
      if (!formData.username.trim()) {
        setError('Please enter your username')
        return false
      }
    } else {
      if (!formData.phone.trim()) {
        setError('Please enter your phone number')
        return false
      }
      if (!/^\d{10}$/.test(formData.phone.trim())) {
        setError('Phone number must be exactly 10 digits')
        return false
      }
    }
    if (!formData.password) {
      setError('Please enter your password')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    try {
      let result

      if (activeTab === 'user') {
        result = await authAPI.loginUser(formData.phone, formData.password)
        if (result.success) {
          onLogin({ ...result.data, id: result.data.user_id }, 'user')
        } else {
          setError(result.error)
        }
      } else if (activeTab === 'worker') {
        result = await authAPI.loginWorker(formData.phone, formData.password)
        if (result.success) {
          onLogin({ ...result.data, id: result.data.worker_id }, 'worker')
        } else {
          setError(result.error)
        }
      } else if (activeTab === 'admin') {
        result = await authAPI.loginAdmin(formData.username, formData.password)
        if (result.success) {
          onLogin({ ...result.data, id: result.data.admin_id }, 'admin')
        } else {
          setError(result.error)
        }
      }

      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Household Service Provider</h2>
        
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('user')
              setError('')
              setFormData({ phone: '', username: '', password: '' })
            }}
          >
            User
          </button>
          <button
            className={`login-tab ${activeTab === 'worker' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('worker')
              setError('')
              setFormData({ phone: '', username: '', password: '' })
            }}
          >
            Worker
          </button>
          <button
            className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin')
              setError('')
              setFormData({ phone: '', username: '', password: '' })
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'admin' ? (
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>
          ) : (
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <p>
            <a
              href="/reset-password"
              onClick={(e) => { e.preventDefault(); navigate('/reset-password') }}
              style={{ color: '#dc3545', textDecoration: 'none', fontWeight: '600' }}
            >
              Forgot Password?
            </a>
          </p>
          <p>
            Don't have an account?{' '}
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault()
                navigate('/register')
              }}
              style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

