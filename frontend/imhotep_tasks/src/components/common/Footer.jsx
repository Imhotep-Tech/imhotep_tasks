import { Link } from 'react-router-dom';
import Logo from '../../assets/imhotep_tasks.png';

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100">
              <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div
                className="font-extrabold text-lg sm:text-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent font-chef"
                style={{ letterSpacing: '0.02em', lineHeight: '1.05' }}
              >
                Imhotep Tasks
              </div>
              <p className="text-gray-600 text-xs sm:text-sm"> Organize Your Productivity</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex space-x-6 text-sm">
              <a href="https://imhoteptech.vercel.app/" className="text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer">Imhotep Tech</a>
              <a href="https://github.com/Imhotep-Tech/imhotep_tasks" className="text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer">Source Code</a>
              <Link to="/download" className="text-blue-600 hover:text-blue-800 transition-colors">Download</Link>
            </div>
            <div className="text-sm text-gray-500">
              <span className="hidden sm:inline">|</span>
              <span className="ml-2 sm:ml-3">&copy; 2025 Imhotep Tasks</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <p className="text-gray-500 text-xs">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;