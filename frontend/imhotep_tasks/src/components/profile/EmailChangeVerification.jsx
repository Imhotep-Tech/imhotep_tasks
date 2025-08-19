import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

const EmailChangeVerification = () => {
  const { uid, token, new_email } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timerId = null;

    const verifyEmailChange = async () => {
      try {
        await axios.post('/api/profile/verify-email-change/', {
          uid,
          token,
          new_email: new_email,
        });

        setStatus('success');
        setMessage('Your email has been changed successfully!');

        timerId = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerId);
              navigate('/login', {
                state: { message: 'Email changed successfully! Please log in again.' }
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.error ||
          'The verification link is invalid or has expired.'
        );
      }
    };

    if (uid && token && new_email) {
      verifyEmailChange();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [uid, token, new_email, navigate]);

  // Helpers
  const decodedEmail = new_email ? decodeURIComponent(new_email) : '';
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
              <path fillRule="evenodd" d="M10.97 15.03a.75.75 0 001.06 0l4.243-4.243a.75.75 0 10-1.06-1.06L11.5 13.439 9.828 11.77a.75.75 0 10-1.06 1.06l2.202 2.2z" clipRule="evenodd" />
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
      case 'verifying': return 'Updating Your Profile...';
      case 'success': return 'Email Updated';
      case 'error': return 'Update Failed';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'verifying':
        return `Please wait while we update your email${decodedEmail ? ` to ${decodedEmail}` : ''}.`;
      case 'success':
        return `Your email has been updated${decodedEmail ? ` to ${decodedEmail}` : ''}. You will be redirected to login shortly.`;
      case 'error':
        return message;
      default:
        return '';
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

              <div className="mt-6 flex justify-center">
                {getIcon()}
              </div>

              <div className="mt-6">
                {status === 'verifying' && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Processing update...</p>
                  </>
                )}

                {status !== 'verifying' && (
                  <div className="mt-4">
                    <Link
                      to={status === 'success' ? '/login' : '/profile'}
                      className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {status === 'success' ? 'Log In Again' : 'Go to Profile'}
                    </Link>
                  </div>
                )}

                {status === 'success' && countdown > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </div>
                )}

                {status === 'error' && (
                  <div className="mt-4 text-sm text-gray-600">
                    If this problem persists, try updating your email again from profile settings or contact support.
                  </div>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Need help? <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-500">Contact support</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default EmailChangeVerification;