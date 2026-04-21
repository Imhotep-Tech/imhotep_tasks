//The main purpose of this file is to redirect the authorized uses from this route automatically to there dashboard
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Navigate } from 'react-router-dom';
import Logo from '../assets/imhotep_tasks.png';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden md:max-w-2xl border border-transparent dark:border-slate-700">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {isDark ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.364 5.657l1.414 1.414M4.222 4.222l1.414 1.414m10.728-1.414l-1.414 1.414M5.636 17.657l-1.414 1.414M12 17a5 5 0 100-10 5 5 0 000 10z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                    </svg>
                  )}
                  <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </button>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-slate-800">
                  <img src={Logo} alt="Logo" className="w-14 h-14 object-contain" />
                </div>
              </div>

              <div
                className="font-extrabold text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent font-chef drop-shadow-lg tracking-wide text-center"
                style={{
                  letterSpacing: '0.04em',
                  lineHeight: '1.1',
                }}
              >
                Imhotep Tasks
              </div>
              <p className="text-gray-500 dark:text-slate-300 text-sm mb-2 text-center">Manage Your Daily Tasks Efficiently</p>
              <h2 className="text-2xl font-bold font-chef text-gray-800 dark:text-gray-100 mb-3 text-center">
                Welcome!
              </h2>
              <p className="text-gray-600 dark:text-slate-300 font-medium mb-6 text-center">
                Imhotep Tasks is starting up...
              </p>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.07s'}}></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.14s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/today-tasks" replace />;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium border border-gray-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-gray-700 dark:text-gray-100 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          {isDark ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.364 5.657l1.414 1.414M4.222 4.222l1.414 1.414m10.728-1.414l-1.414 1.414M5.636 17.657l-1.414 1.414M12 17a5 5 0 100-10 5 5 0 000 10z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
          <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
        </button>
      </div>
      {children}
    </>
  );
};

export default PublicRoute;
