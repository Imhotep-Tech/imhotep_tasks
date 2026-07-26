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
        if (errorMessage === 'Email not verified') {
          needsVerification = true;
          userEmail = formData.username;
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
        localStorage.setItem('pendingVerificationEmail', result.userEmail);
        setInfo('Please verify your email. A verification code has been sent.');
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
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-8">
        <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-6">
            <Link
              to="/"
              className="group relative mb-3 inline-block"
              aria-label="Go to landing page"
            >
              <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-md group-hover:bg-indigo-500/50 transition-all"></div>
              <div className="relative w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-center">
                <img src={Logo} alt="Imhotep Tasks" className="w-full h-full object-contain" />
              </div>
            </Link>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage your daily tasks and routines
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="glass-button-secondary w-full py-3 text-xs flex items-center justify-center font-bold"
            type="button"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="my-5 relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            <span className="absolute px-3 bg-white dark:bg-[#0D1117] text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              or credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {info && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400">
                {info}
              </div>
            )}

            <div>
              <label htmlFor="Email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  id="Email"
                  value={formData.username}
                  onChange={handleChange}
                  className="glass-input pl-10 text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPasswordState ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input pl-10 pr-10 text-sm"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={ShowPassword} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 text-xs uppercase tracking-wider"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create Account
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;