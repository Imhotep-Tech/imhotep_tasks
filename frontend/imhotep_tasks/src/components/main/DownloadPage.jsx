import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/imhotep_tasks.png';

const androidApk = "https://github.com/Imhotep-Tech/imhotep_tasks/releases/latest/download/imhotep-tasks.apk";
const webAppUrl = "https://imhotep-tasks.vercel.app";

export default function DownloadPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('android');

  const handleDownload = () => {
    window.location.href = androidApk;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10">
        
        {/* Header Navigation */}
        <header className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-md flex items-center justify-center">
                <img src={Logo} alt="Imhotep Tasks" className="w-full h-full object-contain" />
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold text-lg tracking-tight">Imhotep Tasks</span>
            </Link>
            
            <Link
              to="/"
              className="glass-button-secondary text-xs py-2 px-4 flex items-center space-x-1.5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Header Title */}
          <div className="text-center mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
              Mobile Installation Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Get Imhotep Tasks on Mobile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
              Manage tasks, routines, and deadlines seamlessly on Android or iOS.
            </p>
          </div>

          {/* Platform Tab Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-200/70 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-800 flex space-x-2">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Android (APK)</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ios'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>iOS (PWA Web App)</span>
              </button>
            </div>
          </div>

          {/* Android Tab Content */}
          {activeTab === 'android' && (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10">
              
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white relative overflow-hidden">
                <button
                  onClick={handleDownload}
                  className="glass-button bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-white dark:text-emerald-800 text-sm py-3.5 px-8 shadow-2xl"
                >
                  Download Android APK
                </button>
                <p className="text-[11px] text-emerald-100 mt-2 font-medium">Official Release v1.0.0 • Direct APK</p>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                  Quick Installation Steps
                </h2>

                {[
                  { num: "1", title: "Download APK File", desc: "Tap the download button above to retrieve the latest APK build." },
                  { num: "2", title: "Allow Unknown Sources", desc: "When prompted by Android, enable 'Install Unknown Apps' for your browser or file manager." },
                  { num: "3", title: "Launch Package Installer", desc: "Open the downloaded APK from your notifications or File Manager." },
                  { num: "4", title: "Complete & Launch", desc: "Tap Install, open the app, and sign in to sync your tasks!" }
                ].map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start space-x-3.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* iOS Tab Content */}
          {activeTab === 'ios' && (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10">
              
              <div className="bg-slate-900 p-6 sm:p-8 text-center text-white">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2 inline-block">
                  PWA Web App Setup
                </span>
                <h2 className="text-xl font-extrabold">Add to Home Screen on iPhone / iPad</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Enjoy an app-like experience with offline caching directly via Safari.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                {[
                  { num: "1", title: "Open in Safari", desc: "Navigate to imhotep-tasks.vercel.app using official Apple Safari." },
                  { num: "2", title: "Tap Share Button", desc: "Tap the Share icon (rectangle with upward arrow) at bottom of browser." },
                  { num: "3", title: "Select 'Add to Home Screen'", desc: "Scroll down the share sheet options and tap Add to Home Screen." },
                  { num: "4", title: "Confirm & Launch", desc: "Tap Add in top right corner. The icon will appear on your home screen!" }
                ].map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start space-x-3.5">
                    <span className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-center">
                  <a
                    href={webAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button text-xs py-3 px-6 inline-block"
                  >
                    Open Web App in Safari
                  </a>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}

