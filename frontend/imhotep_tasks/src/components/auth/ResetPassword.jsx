import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [showPasswordState, setShowPasswordState] = useState(false);
  const [showPasswordState2, setShowPasswordState2] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const validatePasswordResetToken = async (uid, token) => {
    try {
      const response = await axios.post('/api/auth/password-reset/validate/', {
        uid,
        token,
      });
      
      return { 
        success: true, 
        valid: response.data.valid,
        email: response.data.email 
      };
    } catch (error) {
      console.error('Password reset validation failed:', error);
      
      return { 
        success: false, 
        valid: false,
        error: error.response?.data?.error || 'Invalid or expired reset link'
      };
    }
  };

  const confirmPasswordReset = async (uid, token, newPassword, confirmPassword) => {
    try {
      const response = await axios.post('/api/auth/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      
      let errorMessage = 'Password reset failed';
      
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error) 
          ? error.response.data.error.join(', ')
          : error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!uid || !token) {
        setError('Invalid password reset link');
        setValidating(false);
        return;
      }

      const result = await validatePasswordResetToken(uid, token);
      
      if (result.success && result.valid) {
        setIsValidToken(true);
        setUserEmail(result.email);
      } else {
        setError(result.error || 'Invalid or expired password reset link');
      }
      
      setValidating(false);
    };

    validateToken();
  }, [uid, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const result = await confirmPasswordReset(
      uid, 
      token, 
      formData.new_password, 
      formData.confirm_password
    );
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  function ShowPassword() {
    setShowPasswordState(!showPasswordState);
  }

  function ShowPassword2() {
    setShowPasswordState2(!showPasswordState2);
  }

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                  <img src={Logo} alt="logo" className="w-8 h-8" />
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
                {validating ? 'Validating Reset Link...' : !isValidToken ? 'Invalid Reset Link' : success ? 'Password Reset Successful!' : 'Set New Password'}
              </h1>

              <p className="mt-2 text-center text-sm text-gray-600">
                {validating
                  ? 'Please wait while we securely validate your password reset link.'
                  : !isValidToken
                    ? (error || 'This password reset link is invalid or expired.')
                    : success
                      ? 'Your password has been reset. Redirecting to login...'
                      : `Create a secure new password for ${userEmail || 'your account'}`}
              </p>

              <div className="mt-6">
                {/* Validating state: progress */}
                {validating && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Verifying security token...</p>
                  </>
                )}

                {/* Invalid token */}
                {!validating && !isValidToken && (
                  <>
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-red-700 font-medium text-sm">Reset Link Issue</p>
                          <p className="text-red-600 text-sm mt-1">{error || 'This password reset link may have expired or been used already.'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link to="/forgot-password" className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                        Request New Reset Link
                      </Link>
                      <Link to="/login" className="block text-center text-sm text-gray-600 hover:text-gray-800">Back to Login</Link>
                    </div>
                  </>
                )}

                {/* Success */}
                {!validating && isValidToken && success && (
                  <>
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-green-700 font-medium text-sm">Password Updated Successfully</p>
                          <p className="text-green-600 text-sm mt-1">Your new password is now active. You will be redirected to login shortly.</p>
                        </div>
                      </div>
                    </div>

                    <Link to="/login" className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                      Continue to Login
                    </Link>
                  </>
                )}

                {/* Form */}
                {!validating && isValidToken && !success && (
                  <>
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type={showPasswordState ? "text" : "password"}
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border-gray-300 rounded-md"
                            placeholder="Enter your new password"
                            minLength={8}
                          />
                          <button type="button" onClick={ShowPassword} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                            {showPasswordState ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Password must be at least 8 characters long</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 1.586l-4 4v2.828l4-4V1.586zM3.707 3.293a1 1 0 00-1.414 1.414l9 9a1 1 0 001.414 0l9-9a1 1 0 10-1.414-1.414L12 12.586 3.707 3.293zM6 17a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type={showPasswordState2 ? "text" : "password"}
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border-gray-300 rounded-md"
                            placeholder="Confirm your new password"
                            minLength={8}
                          />
                          <button type="button" onClick={ShowPassword2} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                            {showPasswordState2 ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password strength indicator */}
                      {formData.new_password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Password Strength</span>
                            <span className={`text-sm font-medium ${
                              formData.new_password.length >= 12 ? 'text-green-600' :
                              formData.new_password.length >= 8 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {formData.new_password.length >= 12 ? 'Strong' :
                                formData.new_password.length >= 8 ? 'Medium' : 'Weak'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all duration-300 ${
                              formData.new_password.length >= 12 ? 'bg-green-500 w-full' :
                              formData.new_password.length >= 8 ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'
                            }`}></div>
                          </div>
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ResetPassword;