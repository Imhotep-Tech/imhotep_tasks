import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  // Replace feature set with concise features that match the Django template
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
      title: "Deadline Management",
      description: "Never miss a deadline with our intuitive calendar view and reminder system built to keep you on track."
    },
    {
      icon: "⚙️",
      title: "Customizable Workflows",
      description: "Tailor your task management process with flexible workflows that adapt to your needs."
    },
    {
      icon: "📊",
      title: "Analytics & Insights",
      description: "Gain valuable insights into your productivity patterns and task completion rates."
    },
    {
      icon: "🔔",
      title: "Real-time Notifications",
      description: "Stay updated with instant notifications for task reminders, updates, and deadlines."
    },
    {
      icon: "🤝",
      title: "Collaboration Tools",
      description: "Easily share tasks and collaborate with others in real-time for seamless teamwork."
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your data security is our priority. Enjoy peace of mind with our robust security measures."
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access and manage your tasks on the go with our fully responsive mobile-friendly design."
    },
    {
      icon: "🎯",
      title: "Goal Setting & Tracking",
      description: "Set, track, and achieve your personal and professional goals with our goal management features."
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gray-50">
        {/* Hero Section - dark indigo like Django template */}
        <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Manage Tasks, Boost Productivity</h1>
                <p className="text-xl md:text-2xl text-indigo-200 mb-8">Streamline your workflow with our intuitive task management system built for individuals.</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/register"
                    className="inline-block bg-white text-indigo-800 px-6 py-3 rounded-lg font-medium text-lg shadow-lg hover:scale-105 transition-transform"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="md:w-1/2 relative">
                <div className="bg-white p-4 rounded-lg shadow-2xl transform rotate-1 inline-block">
                  <img src={Logo} alt="Imhotep Tasks preview" className="rounded-md w-72 h-auto" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-indigo-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                  <img src={Logo} alt="logo" className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - mirrors Django features area */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Features That Empower Your Workflow</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-5xl">
              {features.slice(0,3).map((f, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works (3 steps) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", icon: "🤖", title: "Create an Account", description: "Sign up for free and set up your personalized dashboard in just minutes." },
                { step: "2", icon: "📋", title: "Add Your Tasks", description: "Create tasks, set priorities and deadlines." },
                { step: "3", icon: "🚀", title: "Boost Productivity", description: "Track progress, and celebrate completing your tasks." }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-indigo-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Download Section */}
        <section className="py-16 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left side - Content */}
              <div className="md:w-1/2 text-white">
                <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                  <span className="text-2xl">📱</span>
                  <span className="font-medium">Now Available on Mobile</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Take Your Tasks Anywhere
                </h2>
                <p className="text-lg text-green-100 mb-6">
                  Download our mobile app and manage your tasks on the go. Available for Android devices with step-by-step installation guide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/download"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-green-700 px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                    </svg>
                    <span>Download for Android</span>
                  </Link>
                  <Link
                    to="/download"
                    className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span>iOS Instructions</span>
                  </Link>
                </div>
              </div>
              
              {/* Right side - Phone mockup */}
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Phone frame */}
                  <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden w-56 h-[28rem] relative">
                      {/* Status bar */}
                      <div className="bg-gray-100 h-6 flex items-center justify-center">
                        <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                      {/* App content */}
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <img src={Logo} alt="App" className="w-10 h-10 rounded-lg" />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Imhotep Tasks</p>
                            <p className="text-xs text-gray-500">Your tasks, anywhere</p>
                          </div>
                        </div>
                        {/* Task items */}
                        <div className="space-y-2">
                          {['Complete project', 'Review notes', 'Team meeting'].map((task, i) => (
                            <div key={i} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                              <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                              <span className={`text-xs ${i === 0 ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task}</span>
                            </div>
                          ))}
                        </div>
                        {/* Add task button */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                          <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg">✨</div>
                  <div className="absolute -bottom-2 -left-2 bg-blue-400 w-6 h-6 rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-indigo-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-white/5 p-10 rounded-3xl shadow-2xl border border-white/10">
              <div className="flex justify-center mb-6">
                <img src={Logo} alt="Logo" className="w-20 h-20 object-contain" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
              <p className="text-lg text-indigo-200 mb-6">Join thousands of users who are already managing their tasks more effectively.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="inline-block bg-white text-indigo-800 px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:scale-105 transition-transform"
                >
                  Start For Free
                </Link>
                <p className="text-sm text-indigo-200">No credit card required • Start in minutes</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
export default LandingPage;