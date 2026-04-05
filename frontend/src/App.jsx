import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import UserDashboard from './pages/UserDashboard'
import UserHistory from './pages/UserHistory'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerHistory from './pages/WorkerHistory'
import AdminDashboard from './pages/AdminDashboard'
import BookAppointment from './pages/BookAppointment'
import Complaints from './pages/Complaints'
import WorkerTracking from './pages/WorkerTracking'
import UserTrackingView from './pages/UserTrackingView'
import WorkerReviews from './pages/WorkerReviews'

function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null) // 'user', 'worker', 'admin'

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedUserType = localStorage.getItem('userType')
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser))
      setUserType(savedUserType)
    }
  }, [])

  // Handle login
  const handleLogin = (userData, type) => {
    setUser(userData)
    setUserType(type)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('userType', type)
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setUserType(null)
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={userType === 'admin' ? '/admin' : userType === 'worker' ? '/worker' : '/user'} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={userType === 'admin' ? '/admin' : userType === 'worker' ? '/worker' : '/user'} />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/user"
          element={
            user && userType === 'user' ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user/history"
          element={
            user && userType === 'user' ? (
              <UserHistory user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/book-appointment"
          element={
            user && userType === 'user' ? (
              <BookAppointment />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/complaints"
          element={
            user && userType === 'user' ? (
              <Complaints user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/worker"
          element={
            user && userType === 'worker' ? (
              <WorkerDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/worker/history"
          element={
            user && userType === 'worker' ? (
              <WorkerHistory user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user && userType === 'admin' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/worker/tracking"
          element={
            user && userType === 'worker' ? (
              <WorkerTracking user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/track-worker"
          element={
            user && userType === 'user' ? (
              <UserTrackingView user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/worker-reviews"
          element={
            user && userType === 'user' ? (
              <WorkerReviews user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App

