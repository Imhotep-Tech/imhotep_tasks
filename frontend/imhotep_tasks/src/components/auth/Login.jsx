import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPasswordState, setShowPasswordState] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (info) setInfo('');
  };

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login/', {
        username,
        password,
      });
      
      const { access, refresh, user: userData } = response.data;
      
      return { 
        success: true, 
        data: { access, refresh, user: userData }
      };
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed';
      let needsVerification = false;
      let userEmail = null;
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        // Check if this is an email verification error
        if (errorMessage === 'Email not verified') {
          needsVerification = true;
          userEmail = formData.username; // Could be email or username
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        needsVerification,
        userEmail,
        info: error.response?.data?.message && error.response.data.error !== error.response.data.message 
          ? error.response.data.message 
          : null
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    const result = await loginUser(formData.username, formData.password);
    
    if (result.success) {
      login(result.data);
      navigate('/today-tasks');
    } else {
      if (result.needsVerification) {
        // Store email for verification page and redirect
        localStorage.setItem('pendingVerificationEmail', result.userEmail);
        setInfo('Please verify your email. A verification code has been sent.');
        // Redirect to verification page after a short delay
        setTimeout(() => navigate('/verify-email'), 2000);
      } else {
        setError(result.error);
        if (result.info) {
          setInfo(result.info);
        }
      }
    }
    
    setLoading(false);
  };

  const getGoogleAuthUrl = async (isDesktop) => {
    try {
      const response = await axios.get('/api/auth/google/url/', { params: { platform: isDesktop ? 'desktop' : 'web' } });
      return response.data.auth_url;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    
    try {
      setGoogleLoading(true);
      const isDesktop = Boolean(window?.desktop);
      const authUrl = await getGoogleAuthUrl(isDesktop);
      if (isDesktop && window?.desktop) {
        // Open externally via Electron to ensure default browser
        window.desktop.navigate(authUrl);
      } else {
        window.location.href = authUrl;
      }
    } catch (error) {
      setError('Failed to initiate Google login');
      setGoogleLoading(false);
    }
  };

  const ShowPassword = () => {
    setShowPasswordState(!showPasswordState);
  };

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

            <h1 className="mt-4 text-3xl font-extrabold text-center text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-center text-sm text-gray-600">Sign in to continue organizing your tasks</p>

            {/* Google sign-in button */}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="button"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                {googleLoading ? 'Redirecting...' : 'Sign in with Google'}
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded">{error}</div>}
              {info && <div className="p-3 bg-blue-50 border border-blue-200 rounded">{info}</div>}

              <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-700">Username or Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    id="Email"
                    value={formData.username}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-md"
                    placeholder="Username or Email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPasswordState ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border-gray-300 rounded-md"
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" onClick={ShowPassword} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPasswordState ? (
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-1"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link></p>
          </div>
        </div>
      </div>
    </section>
    
    <Footer />
    </>
  );
};

export default Login;