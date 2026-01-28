import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import TodayTasks from './components/main/TodayTasks'
import LandingPage from './components/main/LandingPage'
import EmailVerification from './components/auth/EmailVerification'
import GoogleCallback from './components/auth/GoogleCallback'
import Profile from './components/profile/Profile'
import EmailChangeVerification from './components/profile/EmailChangeVerification'
import Next7DaysTasks from './components/main/Next7DaysTasks'
import AllTasks from './components/main/AllTasks'
import Routines from './components/main/Routines'
import ImhotepFinanceConnect from './components/main/ImhotepFinanceConnect'
import ImhotepFinanceCallback from './components/main/ImhotepFinanceCallback'
import InstallPrompt from './components/pwa/InstallPrompt'
import OfflineIndicator from './components/pwa/OfflineIndicator'
import UpdatePrompt from './components/pwa/UpdatePrompt'
import DownloadPage from './components/main/DownloadPage'
import { useEffect } from 'react';
import DesktopAuthHandler from './desktop/DesktopAuthHandler'
import { FinanceProvider } from './contexts/FinanceContext'

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, []);

  return (
    <AuthProvider>
      <FinanceProvider>
        <OfflineIndicator />
        <Router>
          <div>
            <DesktopAuthHandler />
            <Routes>
              <Route 
                path="/" 
                element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
              />
            
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            <Route path="/verify-email/:uid/:token" element={<EmailVerification />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route 
              path="/today-tasks" 
              element={
                <ProtectedRoute>
                  <TodayTasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/next-week-tasks" 
              element={
                <ProtectedRoute>
                  <Next7DaysTasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify-email-change/:uid/:token/:new_email" 
              element={<EmailChangeVerification />} 
            />
            <Route 
              path="/all-tasks" 
              element={
                <ProtectedRoute>
                  <AllTasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance/imhotep" 
              element={
                <ProtectedRoute>
                  <ImhotepFinanceConnect />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance/imhotep/callback" 
              element={
                <ProtectedRoute>
                  <ImhotepFinanceCallback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/routines" 
              element={
                <ProtectedRoute>
                  <Routines />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/download" 
              element={<DownloadPage />} 
            />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <InstallPrompt />
            <UpdatePrompt />
          </div>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App
