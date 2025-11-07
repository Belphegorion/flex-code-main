import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { FiLogOut, FiUser, FiMoon, FiSun, FiMenu, FiX, FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
      setMobileMenuOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'worker') return '/worker';
    if (user?.role === 'organizer') return '/organizer';
    if (user?.role === 'sponsor') return '/sponsor';
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

  return (
  <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-800 transition-all sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-300 dark:hover:to-primary-200 transition-all">
              EVENTFLEX
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-yellow-400" size={22} /> : <FiMoon className="text-gray-700 dark:text-gray-300" size={22} />}
            </button>
            {user && <NotificationBell />}
            {user && (user.role === 'worker' || user.role === 'organizer') && (
              <Link to="/groups" className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300" title="Messages">
                <FiMessageCircle size={22} />
              </Link>
            )}
            {user && (
              <Link to="/leaderboard" className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200" title="Leaderboard">
                <span className="text-xl">🏆</span>
              </Link>
            )}
            {user ? (
              <>
                {user.role === 'worker' && (
              <NavLink to="/jobs" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    Jobs
              </NavLink>
                )}
                <Link to={getDashboardLink()} className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  Dashboard
                </Link>
                <Link to={`/profile/${user.id}`} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <FiUser size={18} />
            <span className="max-w-[140px] truncate">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200">
                  <FiLogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-yellow-400" size={22} /> : <FiMoon className="text-gray-700 dark:text-gray-300" size={22} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-4 space-y-2">
              {user && (
                <div className="flex items-center justify-end mb-2">
                  <NotificationBell />
                </div>
              )}
              {user ? (
                <>
                  {user.role === 'worker' && (
                    <Link
                      to="/jobs"
                      className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Jobs
                    </Link>
                  )}
                  <Link 
                    to={getDashboardLink()} 
                    className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {(user.role === 'worker' || user.role === 'organizer') && (
                    <Link 
                      to="/groups" 
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiMessageCircle size={18} />
                      Messages
                    </Link>
                  )}
                  <Link 
                    to="/leaderboard" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">🏆</span>
                    Leaderboard
                  </Link>
                  <Link 
                    to={`/profile/${user.id}`} 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser size={18} />
                    {user.name}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full text-left"
                  >
                    <FiLogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md text-center transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
