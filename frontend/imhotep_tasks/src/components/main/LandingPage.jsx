import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "📋",
      title: "Task Organization",
      description: "Create, organize and track tasks with ease. Set priorities and deadlines to keep everything in order."
    },
    {
      icon: "⏰",
      title: "Routine Management",
      description: "Build healthy habits with automated routine-based task creation for daily, weekly, or custom schedules."
    },
    {
      icon: "📅",
      title: "Deadline Tracking",
      description: "Never miss a deadline with our intuitive schedule breakdown and automatic priority alerts."
    },
    {
      icon: "⚡",
      title: "Fast Keyboard UX",
      description: "Perform quick actions with intuitive shortcuts and responsive status toggles."
    },
    {
      icon: "📊",
      title: "Analytics & Progress",
      description: "Gain real-time insights into your task completion rates and personal productivity trends."
    },
    {
      icon: "📱",
      title: "Cross-Platform Access",
      description: "Seamlessly transition between desktop web, PWA offline caching, and Android mobile apps."
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              
              <div className="md:w-1/2 text-left">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>Modern Task Management System</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  Organize Work. <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
                    Master Routines.
                  </span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Streamline daily tasks, automate habit creation, and stay ahead of deadlines with Imhotep Tasks.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                  <Link
                    to="/register"
                    className="glass-button py-3.5 px-7 text-xs uppercase tracking-wider text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="glass-button-secondary py-3.5 px-7 text-xs uppercase tracking-wider text-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Hero Graphic Card */}
              <div className="md:w-1/2 w-full flex justify-center">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 max-w-md w-full relative overflow-hidden group">
                  
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/70 dark:border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center p-2">
                        <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Imhotep OS</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Live Workspace Preview</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-through">Quarterly Planning Sync</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Completed</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-500/30 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700"></span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Review Team Deliverables</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Today</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700"></span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Update Routine Workflows</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">Tomorrow</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 border-t border-slate-200/70 dark:border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Designed for High-Performance Focus
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Everything you need to organize your day and build lasting productivity routines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, idx) => (
                <div key={idx} className="glass-card p-6 relative overflow-hidden group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-16 px-4 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-10 tracking-tight">
                3 Steps to Clarity
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Create Your Account", desc: "Sign up in seconds and access your unified task dashboard." },
                  { step: "02", title: "Define Tasks & Habits", desc: "Organize items by categories, due dates, or automated routines." },
                  { step: "03", title: "Execute & Track", desc: "Complete daily goals and review clean progress analytics." }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App CTA */}
        <section className="py-16 px-4 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/90 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="md:w-3/5 text-left">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3 inline-block">
                  📱 Mobile OS Ready
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Take Your Tasks Anywhere
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Download our official Android APK or install as PWA for offline-first synchronization.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/download" className="glass-button text-xs py-3 px-6">
                    Download Android App
                  </Link>
                </div>
              </div>

              <div className="md:w-2/5 flex justify-center">
                <div className="w-36 h-36 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-5xl shadow-2xl">
                  📲
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default LandingPage;