//The main purpose of this file is to redirect the authorized uses from this route automatically to there dashboard
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Logo from '../assets/imhotep_tasks.png';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
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
                Pharaohfolio
              </div>
              <p className="text-gray-500 text-sm mb-2 text-center">Simple Hosting for Single-Page Portfolios</p>
              <h2 className="text-2xl font-bold font-chef text-gray-800 mb-3 text-center">
                Welcome!
              </h2>
              <p className="text-gray-600 font-medium mb-6 text-center">
                Your AI-powered portfolio is starting up...
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

  return isAuthenticated ? <Navigate to="/today-tasks" replace /> : children;
};

export default PublicRoute;
