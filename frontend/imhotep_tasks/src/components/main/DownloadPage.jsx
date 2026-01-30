import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="Imhotep Tasks" className="w-10 h-10 rounded-lg" />
            <span className="text-white font-bold text-xl">Imhotep Tasks</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-200 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>
              <a href="/">Back to Home</a>
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-2xl mb-6">
            <img src={Logo} alt="Imhotep Tasks Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Imhotep Tasks on Mobile
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Take your productivity anywhere with our mobile app. Manage tasks, track habits, and stay organized on the go.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-800/50 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'android'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
              </svg>
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'ios'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>iOS</span>
            </button>
          </div>
        </div>

        {/* Android Tab Content */}
        {activeTab === 'android' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Download Button Section */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-3 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download APK Now</span>
              </button>
              <p className="text-green-100 mt-3 text-sm">Version 1.0.0 • ~25 MB</p>
            </div>

            {/* Step by Step Instructions */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Installation Guide
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Download the APK</h3>
                    <p className="text-gray-600 mt-1">
                      Click the "Download APK Now" button above. The file will start downloading automatically to your device.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Enable Unknown Sources</h3>
                    <p className="text-gray-600 mt-1">
                      When you try to install, Android will prompt you to allow installation from unknown sources. Follow these steps:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside ml-2">
                      <li>Go to <strong>Settings → Security</strong></li>
                      <li>Enable <strong>"Install unknown apps"</strong> for your browser or file manager</li>
                      <li>Some devices: <strong>Settings → Apps → Special access → Install unknown apps</strong></li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Open the Downloaded File</h3>
                    <p className="text-gray-600 mt-1">
                      Find the downloaded APK file in your notifications or in the <strong>Downloads</strong> folder using your file manager. Tap on it to begin installation.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Install the App</h3>
                    <p className="text-gray-600 mt-1">
                      Tap <strong>"Install"</strong> when prompted. Wait for the installation to complete, then tap <strong>"Open"</strong> to launch Imhotep Tasks!
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800">Is it safe?</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Yes! This APK is built directly from our open-source repository. You can verify the source code on{' '}
                      <a href="https://github.com/Imhotep-Tech/imhotep_tasks" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* iOS Tab Content */}
        {activeTab === 'ios' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-200 px-4 py-2 rounded-full mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Web App Installation</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Install as Progressive Web App</h2>
              <p className="text-gray-300 max-w-xl mx-auto">
                Since this is a free hobby project, there's no native iOS app on the App Store (Apple's $99/year developer fee is quite steep for a free app!). 
                But don't worry – you can install Imhotep Tasks as a web app that works just like a native app!
              </p>
            </div>

            {/* PWA Benefits */}
            <div className="p-6 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800 mb-3">✨ Web App Benefits:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Home screen icon</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full-screen experience</span>
                </div>
              </div>
            </div>

            {/* Step by Step Instructions */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gray-100 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </span>
                Safari Installation Guide
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Open Safari Browser</h3>
                    <p className="text-gray-600 mt-1">
                      <strong>Important:</strong> You must use Safari browser on your iPhone or iPad. This won't work with Chrome or other browsers on iOS.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Visit Imhotep Tasks</h3>
                    <p className="text-gray-600 mt-1">
                      Navigate to our web app:
                    </p>
                    <a 
                      href={webAppUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 mt-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>imhotep-tasks.vercel.app</span>
                    </a>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Tap the Share Button</h3>
                    <p className="text-gray-600 mt-1">
                      Look for the <strong>Share</strong> icon at the bottom of Safari (a square with an arrow pointing up). Tap on it to open the share menu.
                    </p>
                    <div className="mt-3 inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Select "Add to Home Screen"</h3>
                    <p className="text-gray-600 mt-1">
                      Scroll down in the share menu and tap <strong>"Add to Home Screen"</strong>. You may need to scroll to find this option.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Confirm Installation</h3>
                    <p className="text-gray-600 mt-1">
                      Tap <strong>"Add"</strong> in the upper right corner. The Imhotep Tasks icon will now appear on your home screen like any other app!
                    </p>
                  </div>
                </div>
              </div>

              {/* Open Safari Button */}
              <div className="mt-8 text-center">
                <a
                  href={webAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Open in Safari</span>
                </a>
              </div>

              {/* Why No App Store */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-semibold text-amber-800">Why isn't this on the App Store?</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      Imhotep Tasks is a free, open-source hobby project. Publishing on the Apple App Store requires a $99/year developer membership, which doesn't make sense for a completely free app. 
                      The web app provides nearly identical functionality and is always up-to-date!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Code Link */}
        <div className="mt-12 text-center">
          <p className="text-indigo-200 mb-4">Imhotep Tasks is open source under AGPL-3.0</p>
          <a
            href="https://github.com/Imhotep-Tech/imhotep_tasks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      </main>
    </div>
  );
}
