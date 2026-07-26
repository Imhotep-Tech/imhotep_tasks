import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/imhotep_tasks.png';

const Navbar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      const shouldBeOpen = !mobile;
      setIsOpen(shouldBeOpen);
      if (onToggle) onToggle(shouldBeOpen);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onToggle]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const closeNavbar = () => {
    if (isMobile) {
      setIsOpen(false);
      if (onToggle) onToggle(false);
    }
  };

  const navLinks = [
    {
      path: '/today-tasks',
      label: "Today's Tasks",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeColor: 'from-indigo-500 to-blue-600'
    },
    {
      path: '/next-week-tasks',
      label: 'Next 7 Days',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badgeColor: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/all-tasks',
      label: 'All Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      badgeColor: 'from-violet-500 to-indigo-500'
    },
    {
      path: '/routines',
      label: 'Routines',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      badgeColor: 'from-emerald-500 to-teal-500'
    },
    {
      path: '/profile',
      label: 'Profile & Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      badgeColor: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <>
      {/* Floating Ambient Light - Top Left Glow */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      )}

      {/* Toggle Sidebar Button */}
      <button 
        className="fixed top-4 left-4 z-50 p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={toggleNavbar}
        aria-label="Toggle navigation sidebar"
        title={isOpen ? 'Collapse navigation' : 'Expand navigation'}
      >
        <svg 
          className={`w-5 h-5 text-slate-700 dark:text-slate-200 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar Panel */}
      <nav className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out ${
        isMobile 
          ? (isOpen ? 'translate-x-0' : '-translate-x-full') 
          : (isOpen ? 'translate-x-0' : '-translate-x-64')
      }`}>
        <div className="h-full w-64 bg-white/85 dark:bg-[#090D16]/90 backdrop-blur-2xl border-r border-slate-200/70 dark:border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto px-4 pt-16 pb-6 scrollbar-none">
            
            {/* Brand Logo & Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-3 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-center">
                  <img 
                    src={Logo} 
                    alt="Imhotep Tasks" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Imhotep Tasks
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Productivity & Task OS
              </p>
            </div>

            {/* User Profile Card */}
            <div className="mb-6">
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-slate-100 font-semibold text-xs truncate">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user?.username || 'User'
                      }
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user?.email}</p>
                  </div>
                </div>

                {!user?.email_verify && (
                  <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Verify Email</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeNavbar}
                    className={`group relative flex items-center px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}>
                      {link.icon}
                    </div>
                    <span>{link.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* Footer & Logout Section */}
          <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium text-xs transition-all duration-200 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Imhotep Tasks v2.0
            </p>
          </div>

        </div>
      </nav>

      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30 transition-opacity" 
          onClick={closeNavbar}
        ></div>
      )}
    </>
  );
};

export default Navbar;