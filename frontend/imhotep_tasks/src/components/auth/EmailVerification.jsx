import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('input'); // 'input', 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from localStorage (set during registration)
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const verifyEmail = async (otpCode, userEmail) => {
    try {
      const response = await axios.post('/api/auth/verify-email/', 
        { otp: otpCode, email: userEmail }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Verification failed. Please try again.' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setStatus('verifying');
    setError('');
    setLoading(true);

    const result = await verifyEmail(otp, email);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Your email has been verified successfully!');
      // Clear the stored email
      localStorage.removeItem('pendingVerificationEmail');
      
      // Start countdown
      let count = 5;
      const timerId = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timerId);
          navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
        }
      }, 1000);
    } else {
      setStatus('input');
      setError(result.error);
    }
    
    setLoading(false);
  };

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
            <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M11.25 2.25a9 9 0 100 18 9 9 0 000-18zM12 8a1 1 0 10-2 0v4a1 1 0 102 0V8zm0 8a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'input': return 'Verify Your Email';
      case 'verifying': return 'Verifying...';
      case 'success': return 'Email Verified';
      case 'error': return 'Verification Failed';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'input': return 'Enter the 6-digit OTP code sent to your email. The code expires in 10 minutes.';
      case 'verifying': return 'Please wait while we verify your email address.';
      case 'success': return message || 'Your email has been verified. Redirecting to login shortly.';
      case 'error': return message;
      default: return '';
    }
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="p-8 w-full text-center">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                  <img src={Logo} alt="logo" className="w-8 h-8" />
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold text-center text-gray-900">{getTitle()}</h1>
              <p className="mt-2 text-center text-sm text-gray-600">{getSubtitle()}</p>

              {(status === 'verifying' || status === 'success') && (
                <div className="mt-6 flex justify-center">
                  {getIcon()}
                </div>
              )}

              <div className="mt-6">
                {status === 'input' && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        required
                        readOnly={true}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-3 border-gray-300 rounded-md"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ''));
                          if (error) setError('');
                        }}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-3 border-gray-300 rounded-md text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6 || !email}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{' '}
                      <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Login to resend
                      </Link>
                    </p>
                  </form>
                )}

                {status === 'verifying' && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Processing verification...</p>
                  </>
                )}

                {status === 'success' && (
                  <>
                    <div className="mt-4">
                      <Link
                        to="/login"
                        className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Login
                      </Link>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default EmailVerification;
