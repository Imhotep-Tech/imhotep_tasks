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