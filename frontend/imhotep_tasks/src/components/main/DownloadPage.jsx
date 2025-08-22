import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePWA } from '../../hooks/usePWA';
import Footer from '../common/Footer';
import Logo from '../../assets/imhotep_tasks.png';

const electronReleases = {
  windows: "https://github.com/Imhotep-Tech/imhotep_tasks/releases/latest/download/Imhotep.Tasks_Setup_1.0.0.exe",
  macos: "https://github.com/Imhotep-Tech/imhotep_tasks/releases/latest/download/Imhotep.Tasks-1.0.0.dmg",
  linux: "https://github.com/Imhotep-Tech/imhotep_tasks/releases/latest/download/Imhotep.Tasks_1.0.0.snap"
};
const androidApk = "https://github.com/Imhotep-Tech/imhotep_tasks/releases/latest/download/imhotep-tasks.apk";
const snapStore = "https://snapcraft.io/imhoteptasks";
const webAppUrl = "https://imhotep-tasks.vercel.app";

export default function DownloadPage() {
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();

  return (
    <>
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow">
                <img src={Logo} alt="Imhotep Tasks Logo" className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Download Imhotep Tasks</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get our task management app on your preferred platform and stay productive wherever you go.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow transition-all"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Download options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Android */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Android</h2>
                <p className="text-gray-600 text-center mb-6">Download our app from Google Play or directly as an APK file.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Download the APK file</li>
                    <li>Enable "Install from Unknown Sources" in your device settings</li>
                    <li>Open the downloaded APK file</li>
                    <li>Follow the installation prompts</li>
                  </ol>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex justify-center space-x-4">
                <a href={androidApk} 
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download APK
                </a>
              </div>
            </div>
            {/* Windows */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Windows</h2>
                <p className="text-gray-600 text-center mb-6">Install our Windows desktop application for a seamless experience.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Download the installer (.exe) file</li>
                    <li>Double-click the installer</li>
                    <li>If prompted by Windows security, click "Run anyway"</li>
                    <li>Follow the installation wizard</li>
                  </ol>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex justify-center">
                <a href={electronReleases.windows} 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download for Windows
                </a>
              </div>
            </div>
            {/* macOS */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">macOS</h2>
                <p className="text-gray-600 text-center mb-6">Get our macOS app for a native Apple experience.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Download the DMG file</li>
                    <li>Double-click to open the disk image</li>
                    <li>Drag Imhotep Tasks to Applications folder</li>
                    <li>If you see a security warning, right-click and select "Open"</li>
                  </ol>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex justify-center">
                <a href={electronReleases.macos} 
                  className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded flex items-center transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download for macOS
                </a>
              </div>
            </div>
            {/* Linux */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.898-.25 1.509.225.678.997 1.259 1.7 1.18.205-.027.49-.139.733-.275.398-.2.877-.414 1.384-.453 1.358-.106 2.2.634 3.15.634.929 0 1.77-.74 3.15-.635.51.04.989.253 1.386.453.244.136.527.248.732.276.703.08 1.475-.501 1.7-1.18.2-.61.009-1.24-.25-1.508a.425.425 0 00-.11-.136c.124-.805-.008-1.657-.287-2.488-.589-1.772-1.832-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.066-1.49 1.055-5.964-3.171-6.297a5.13 5.13 0 00-.48-.022m-.287 2.918c1.32-.066 2.637.898 2.701 2.914 0 0-1.17-.172-1.876.395-.745.586-.339 1.336-.339 1.336s-2.32.123-3.565-1.426c-.481-.6-.76-1.383-.555-2.337.193-.912.94-.856 3.634-.882M10 6.25v.227c0 .803 1.569.803 1.569 0V6.25c0-.803-1.57-.803-1.57 0m2.55.248c-.01.043-.01.087-.01.131 0 .803 1.57.803 1.57 0 0-.803-1.57-.803-1.57 0m-4.086.131v.13c0 .803 1.569.803 1.569 0v-.13c0-.804-1.57-.804-1.57 0M19 10.327V11.251c0 3.708-4.262 6.439-7 6.439-2.738 0-7-2.73-7-6.439v-.924c0-3.708 4.262-4.472 7-4.472 2.738 0 7 .764 7 4.472m-14 .498v.426c0 3.215 3.115 5.823 7 5.823s7-2.608 7-5.823v-.426c0-.253-.022-.506-.063-.756-.5.325-.636.653-1.337.85-.697.197-2.22.175-3.55-.262-1.08-.356-2.036-1.949-4.833-1.131-.902.262-1.81.887-2.962 1.355-.146.058-.29.114-.436.164-.073.316-.12.64-.12.968v.287c0 .21.113.39.274.48a.504.504 0 00.485 0c.161-.09.274-.27.274-.48v-.287c0-.172.03-.338.084-.496a.87.87 0 00.282-.136l.9-.738c.363-.296.82-.558 1.333-.73.929-.307 1.506-.114 1.71.136a.57.57 0 01.12.37v.881c0 .211.113.39.274.48a.504.504 0 00.485 0c.162-.09.274-.269.274-.48v-.881c0-.425-.17-.824-.467-1.122-.297-.298-.696-.468-1.12-.47-.227-.001-.453.054-.657.154-.22.109-.418.258-.59.428l-.705.579v-.152c0-.385.1-.87.633-1.155 1.66-.888 2.514-.328 3.254.109 1.797 1.061 3.332.519 4.243.136.786-.33 1.182-.81 1.376-1.33.044-.117.08-.237.108-.359-.337-.506-.819-.936-1.419-1.268-2.619-1.448-7.469-1.448-10.088 0a4.072 4.072 0 00-1.418 1.268c.405 1.722 2.915 3.392 6.775 3.56a.635.635 0 00.484-.164.615.615 0 00.2-.453.626.626 0 00-.2-.454.635.635 0 00-.484-.164c-3.59-.157-5.876-1.729-5.896-2.977.064-.386.212-.696.443-.915 2.147-1.19 6.5-1.19 8.647 0 .232.219.38.529.443.915-.01.634-.851 1.449-2.218 2.007-.467.189-1.23.243-1.929.134-.7-.11-1.318-.427-1.859-.908a.635.635 0 00-.484-.164.615.615 0 00-.2.453c0 .17.065.336.185.453.667.594 1.642 1.05 2.642 1.201.338.05.687.076 1.035.076.652 0 1.304-.099 1.756-.29 1.976-.802 3.071-2.05 3.071-3.512v-.924c0-.267.04-.526.111-.77-.152-.252-.33-.494-.533-.723M5.5 13.876c0 .803 1.569.803 1.569 0 0-.803-1.57-.803-1.57 0m11.44 0c0 .803 1.569.803 1.569 0 0-.803-1.57-.803-1.57 0"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Linux</h2>
                <p className="text-gray-600 text-center mb-6">Available on the Snap Store or as a direct download.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Instructions:</p>
                  <div className="mb-2">
                    <p className="font-medium">Snap Store:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Install directly via: <code>sudo snap install imhoteptasks</code></li>
                      <li>Or click the "Get it from the Snap Store" button below</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                <a href={snapStore} className="flex justify-center">
                  <img alt="Get it from the Snap Store" src="https://snapcraft.io/en/dark/install.svg" className="h-10" />
                </a>
                <a href={electronReleases.linux} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded flex items-center transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .snap
                </a>
              </div>
            </div>
            {/* PWA */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">PWA</h2>
                <p className="text-gray-600 text-center mb-4">Install as a Progressive Web App on any device with a modern browser.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Instructions:</p>
                  <div className="mb-2">
                    <p className="font-medium">Chrome/Edge:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Visit our website</li>
                      <li>Click the install icon (+ symbol) in the address bar</li>
                      <li>Click "Install"</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium">Firefox:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Visit our website</li>
                      <li>Click three dots menu</li>
                      <li>Select "Install app"</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex justify-center">
                <button
                  onClick={installApp}
                  disabled={!isInstallable}
                  className={`bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex items-center transition-colors ${isInstallable ? '' : 'opacity-50 cursor-not-allowed'}`}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isInstallable ? 'Install as PWA' : 'Already Installed or Not Supported'}
                </button>
                <a href={webAppUrl} className="ml-3 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded flex items-center transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Visit Web App
                </a>
              </div>
            </div>
            {/* iOS */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-transform transform hover:scale-105">
              <div className="p-6 flex-grow">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">iOS</h2>
                <p className="text-gray-600 text-center mb-4">Install as a web app on your iPhone or iPad using Safari.</p>
                <div className="text-sm text-gray-600 mt-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-2">Installation Steps:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Open <a href={webAppUrl} className="text-blue-600">imhotep-tasks.vercel.app</a> in Safari</li>
                    <li>Tap the Share icon <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M13 4v2.67l-1.33.67 1.33.67V10H7V8.67l1.33-.67L7 7.33V4h6zm-2 9a1 1 0 100-2 1 1 0 000 2z"/></svg> at the bottom of the screen</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the upper right corner</li>
                    <li>Find the app icon on your home screen</li>
                  </ol>
                </div>
              </div>
              <div className="bg-gray-50 p-4">
                <a href={webAppUrl} 
                  className="block w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded text-center transition-colors">
                  Open in Safari
                </a>
              </div>
            </div>
          </div>
          
          {/* Source Code section */}
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Source Code</h2>
            <p className="text-gray-600 mb-4">Imhotep Tasks is open source under AGPL-3.0 for non-commercial use. Check out our repository:</p>
            <a href="https://github.com/Imhotep-Tech/imhotep_tasks" 
              className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              View Source Code
            </a>
          </div>
          {/* GitHub repository section */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Releases</h2>
            <p className="text-gray-600 mb-6">Want to access previous versions or see what's new? Check out our GitHub repository for all releases.</p>
            <a href="https://github.com/Imhotep-Tech/imhotep_tasks/releases/" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
