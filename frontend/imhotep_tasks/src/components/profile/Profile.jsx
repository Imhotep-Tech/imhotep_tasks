import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';

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
      
      // Check if email verification is required
      if (response.data.email_verification_required) {
        setPendingNewEmail(response.data.pending_new_email);
        setShowOtpModal(true);
        setSuccess('A verification code has been sent to your new email address.');
      } else {
        setSuccess(response.data.message);
      }
      
      // Update user context with new data
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
      const response = await axios.post('/api/profile/verify-email-change/', 
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowOtpModal(false);
      setOtp('');
      setSuccess('Email changed successfully! Please log in again with your new email.');
      
      // Log out user after email change
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
    // Reset email to current value since verification was cancelled
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

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                  {/* small logo */}
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold text-center text-gray-900">My Profile</h1>
              <p className="mt-2 text-center text-sm text-gray-600">Manage your account and preferences</p>

              <div className="mt-6">
                {/* Tabs */}
                <div className="rounded-md bg-gray-50 p-1 grid grid-cols-2 gap-2">
                  <button
                    className={`py-2 px-3 rounded-md text-sm font-medium transition ${activeTab === 'profile' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:bg-white/80'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Information
                  </button>
                  <button
                    className={`py-2 px-3 rounded-md text-sm font-medium transition ${activeTab === 'password' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:bg-white/80'}`}
                    onClick={() => setActiveTab('password')}
                  >
                    Change Password
                  </button>
                </div>

                {/* Messages */}
                <div className="mt-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm mb-4">
                      {Array.isArray(error) ? error.join(', ') : error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm mb-4">
                      {Array.isArray(success) ? success.join(', ') : success}
                    </div>
                  )}
                </div>

                {/* Profile Form */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleProfileChange}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition-all duration-150"
                            placeholder="First name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={profileData.last_name}
                            onChange={handleProfileChange}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition-all duration-150"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <input
                          id="username"
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleProfileChange}
                          required
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition-all duration-150"
                          placeholder="Username"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition-all duration-150"
                          placeholder="you@example.com"
                        />
                      </div>
                      {!user?.email_verify && (
                        <p className="mt-2 text-sm text-amber-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          Email not verified. Please check your email.
                        </p>
                      )}
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-1`}
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Password Form */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="current_password"
                          type={showPasswords.current ? 'text' : 'password'}
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          required
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md transition-all duration-150"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          aria-label="Toggle password visibility"
                        >
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showPasswords.current ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">New Password <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="new_password"
                          type={showPasswords.new ? 'text' : 'password'}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md transition-all duration-150"
                          placeholder="New password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          aria-label="Toggle password visibility"
                        >
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showPasswords.new ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm New Password <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="confirm_password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md transition-all duration-150"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          aria-label="Toggle password visibility"
                        >
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showPasswords.confirm ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-1`}
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                  <Link to="/today-tasks" className="font-medium text-blue-600 hover:text-blue-500">Back to Today Tasks</Link> • <button onClick={logout} className="text-red-600">Logout</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Close button */}
            <button
              onClick={closeOtpModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verify Your New Email</h3>
              <p className="text-sm text-gray-600 mt-2">
                We've sent a 6-digit verification code to <span className="font-medium text-blue-600">{pendingNewEmail}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">The code expires in 10 minutes</p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {otpError}
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter Verification Code</label>
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
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-4 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeOtpModal}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
