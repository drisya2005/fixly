import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

function ResetPassword() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('user') // 'user', 'worker', 'admin'

  // User/Worker OTP flow state
  const [step, setStep] = useState(1) // 1: phone, 2: verify OTP, 3: new password
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [displayedOtp, setDisplayedOtp] = useState('') // OTP shown to user (demo mode)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Admin state (no OTP)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminNewPassword, setAdminNewPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const switchTab = (tab) => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
    setStep(1)
    setPhone('')
    setOtp('')
    setDisplayedOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setAdminUsername('')
    setAdminNewPassword('')
    setAdminConfirmPassword('')
  }

  // ===== USER/WORKER OTP FLOW =====

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Phone number must be exactly 10 digits')
      return
    }

    setLoading(true)
    const result = await authAPI.sendOtp(phone.trim(), activeTab)

    if (result.success) {
      setDisplayedOtp(result.data.otp) // Demo: show OTP on screen
      setStep(2) // Move to OTP verification step
      setSuccess('OTP sent to your phone! (Demo mode: OTP shown above)')
    } else {
      setError(result.error || 'Failed to send OTP')
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }
    if (otp.trim().length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)
    const result = await authAPI.verifyOtp(phone.trim(), activeTab, otp.trim())

    if (result.success) {
      setStep(3) // Move to password reset step
      setSuccess('OTP verified! Now set your new password.')
    } else {
      setError(result.error || 'Invalid or expired OTP')
    }

    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword) {
      setError('Please enter a new password')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!confirmPassword) {
      setError('Please confirm your password')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    let result
    if (activeTab === 'user') {
      result = await authAPI.resetUserPassword(phone.trim(), newPassword)
    } else {
      result = await authAPI.resetWorkerPassword(phone.trim(), newPassword)
    }

    if (result.success) {
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error || 'Password reset failed')
    }

    setLoading(false)
  }

  // ===== ADMIN RESET (NO OTP) =====

  const handleAdminReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!adminUsername.trim()) {
      setError('Please enter your username')
      return
    }
    if (!adminNewPassword) {
      setError('Please enter a new password')
      return
    }
    if (adminNewPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!adminConfirmPassword) {
      setError('Please confirm your password')
      return
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await authAPI.resetAdminPassword(adminUsername.trim(), adminNewPassword)

    if (result.success) {
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error || 'Password reset failed')
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Reset Password</h2>

        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => switchTab('user')}
          >
            User
          </button>
          <button
            className={`login-tab ${activeTab === 'worker' ? 'active' : ''}`}
            onClick={() => switchTab('worker')}
          >
            Worker
          </button>
          <button
            className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => switchTab('admin')}
          >
            Admin
          </button>
        </div>

        {/* USER/WORKER OTP FLOW */}
        {activeTab !== 'admin' && (
          <div>
            {/* STEP 1: Enter Phone */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="input-group">
                  <label>Registered Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your 10-digit phone number"
                    maxLength={10}
                  />
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '8px', padding: '15px', marginBottom: '20px', color: '#856404' }}>
                  <strong>Demo Mode - OTP:</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#ff6b00', letterSpacing: '3px' }}>
                    {displayedOtp}
                  </div>
                </div>

                <div className="input-group">
                  <label>Enter OTP *</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="Enter 6-digit OTP shown above"
                    maxLength={6}
                  />
                  <small style={{ color: '#666', marginTop: '5px' }}>OTP expires in 5 minutes</small>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: '1px solid #ddd',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Back to Phone
                </button>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="input-group">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(2); setOtp(''); }}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: '1px solid #ddd',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Back to OTP
                </button>
              </form>
            )}
          </div>
        )}

        {/* ADMIN RESET (NO OTP) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminReset}>
            <div className="input-group">
              <label>Username *</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter your admin username"
              />
            </div>

            <div className="input-group">
              <label>New Password *</label>
              <input
                type="password"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div className="input-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); navigate('/login') }}
            style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
