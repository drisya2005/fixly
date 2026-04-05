import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('user') // 'user' or 'worker'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    houseName: '',
    city: '',
    district: '',
    location: '',   // pincode
    // Worker-specific fields
    serviceType: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const serviceTypes = ['Plumber', 'Electrician', 'Cleaner', 'Carpenter', 'Painter', 'Mechanic']

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleRoleChange = (e) => {
    setRole(e.target.value)
    setError('')
    setSuccess('')
    // Clear worker-specific fields when switching to user
    if (e.target.value === 'user') {
      setFormData({
        ...formData,
        serviceType: '',
      })
    }
  }

  const validateForm = () => {
    // Name: letters and spaces only, min 2 chars
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      setError('Name must contain only letters and spaces')
      return false
    }

    // Email: standard format
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address (e.g. name@example.com)')
      return false
    }

    // Phone: exactly 10 digits
    if (!formData.phone.trim()) {
      setError('Please enter your phone number')
      return false
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits (numbers only)')
      return false
    }

    // Password: min 6 chars
    if (!formData.password) {
      setError('Please enter a password')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    // House Name: required, min 3 chars
    if (!formData.houseName.trim()) {
      setError('Please enter your house / building name')
      return false
    }
    if (formData.houseName.trim().length < 3) {
      setError('House name must be at least 3 characters')
      return false
    }
    if (formData.houseName.trim().length > 100) {
      setError('House name must be under 100 characters')
      return false
    }

    // City: letters and spaces only
    if (!formData.city.trim()) {
      setError('Please enter your city')
      return false
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      setError('City must contain only letters and spaces')
      return false
    }
    if (formData.city.trim().length < 2) {
      setError('City must be at least 2 characters')
      return false
    }

    // District: letters and spaces only
    if (!formData.district.trim()) {
      setError('Please enter your district')
      return false
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.district.trim())) {
      setError('District must contain only letters and spaces')
      return false
    }
    if (formData.district.trim().length < 2) {
      setError('District must be at least 2 characters')
      return false
    }

    // Pincode: exactly 6 digits
    if (!formData.location.trim()) {
      setError('Please enter your pincode')
      return false
    }
    if (!/^\d{6}$/.test(formData.location.trim())) {
      setError('Pincode must be exactly 6 digits')
      return false
    }

    // Worker-specific validations
    if (role === 'worker') {
      if (!formData.serviceType) {
        setError('Please select a service type')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      let result

      // Prepare registration data with role
      const registrationData = {
        role: role,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        house_name: formData.houseName,
        city: formData.city,
        district: formData.district,
        location: formData.location,
      }

      // Add worker-specific fields if role is worker
      if (role === 'worker') {
        registrationData.service_type = formData.serviceType
      }

      result = await authAPI.register(registrationData)

      if (result.success) {
        setSuccess(`Registration successful! Redirecting to login...`)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(`Failed to connect to server: ${err.message || 'Make sure backend is running on http://127.0.0.1:5000'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <h2>Create Account</h2>

        {/* Role Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: '600', color: '#333' }}>
            Register As:
          </label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === 'user'}
                onChange={handleRoleChange}
                style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '16px' }}>User</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="worker"
                checked={role === 'worker'}
                onChange={handleRoleChange}
                style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '16px' }}>Worker</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div className="input-group">
            <label>House / Building Name *</label>
            <input
              type="text"
              name="houseName"
              value={formData.houseName}
              onChange={handleChange}
              placeholder="e.g. Rose Villa, Flat 4B, Green Apartments"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="input-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="input-group">
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter your district"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              required
            />
          </div>

          {/* Worker-Specific Fields */}
          {role === 'worker' && (
            <>
              <div className="input-group">
                <label>Service Type *</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <p>
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
              style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

