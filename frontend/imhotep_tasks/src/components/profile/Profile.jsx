import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';
import { usePWA } from '../../hooks/usePWA';
import { useTheme } from '../../contexts/ThemeContext';

const Profile = () => {
  const { user, logout, updateUser, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email verification modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [refreshingApp, setRefreshingApp] = useState(false);
  const { refreshAppAndClearCache } = usePWA();
  const { isDark, toggleTheme } = useTheme();

  // Load profile data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/profile/update/', profileData);
      
      if (response.data.email_verification_required) {
        setPendingNewEmail(response.data.pending_new_email);
        setShowOtpModal(true);
        setSuccess('A verification code has been sent to your new email address.');
      } else {
        setSuccess(response.data.message);
      }
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await axios.post('/api/profile/verify-email-change/', 
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowOtpModal(false);
      setOtp('');
      setSuccess('Email changed successfully! Please log in again with your new email.');
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setOtpError(error.response?.data?.error || 'Verification failed. Please try again.');
    }
    
    setOtpLoading(false);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpError('');
    setProfileData(prev => ({ ...prev, email: user.email }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/profile/change-password/', passwordData);
      setSuccess(response.data.message);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to change password');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleRefreshApp = async () => {
    setRefreshingApp(true);
    try {
      await refreshAppAndClearCache();
    } catch (error) {
      console.error('Failed to refresh app:', error);
      setError('Failed to refresh app cache. Please try again.');
      setRefreshingApp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-2xl relative z-10 my-4">
        
        <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-9 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/70 dark:border-white/10">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-lg shadow-inner">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Account Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage security & personal credentials</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
            <button
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Info
            </button>
            <button
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'password' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Security & Password
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-600 dark:text-red-400 mb-5">
              {Array.isArray(error) ? error.join(', ') : error}
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 mb-5">
              {Array.isArray(success) ? success.join(', ') : success}
            </div>
          )}

          {/* Profile Details Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="glass-input text-sm"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="glass-input text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  required
                  className="glass-input text-sm"
                  placeholder="username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                  className="glass-input text-sm"
                  placeholder="name@example.com"
                />
                {!user?.email_verify && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center font-medium">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Email not verified. Please check your inbox for verification email.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button w-full py-3 text-xs uppercase tracking-wider"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="current_password"
                    type={showPasswords.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    className="glass-input pr-10 text-sm"
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPasswords.current ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    type={showPasswords.new ? 'text' : 'password'}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    className="glass-input pr-10 text-sm"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPasswords.new ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    className="glass-input pr-10 text-sm"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPasswords.confirm ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button w-full py-3 text-xs uppercase tracking-wider"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Actions Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRefreshApp}
              disabled={refreshingApp}
              className="glass-button-secondary text-xs flex-1 py-2.5"
            >
              {refreshingApp ? 'Clearing Cache...' : 'Update App & Clear Cache'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex-1"
            >
              Sign Out
            </button>
          </div>

        </div>
      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200/80 dark:border-white/10 relative">
            <button
              onClick={closeOtpModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Verify Email Change</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-800 dark:text-slate-200">{pendingNewEmail}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {otpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
                  {otpError}
                </div>
              )}

              <div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (otpError) setOtpError('');
                  }}
                  required
                  autoFocus
                  className="glass-input text-center text-2xl tracking-[0.4em] font-mono py-3"
                  placeholder="000000"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeOtpModal}
                  className="glass-button-secondary text-xs flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="glass-button text-xs flex-1 py-2.5 disabled:opacity-50"
                >
                  {otpLoading ? 'Verifying...' : 'Confirm Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;

