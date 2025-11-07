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
    <nav className="sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 nav-glass p-2 rounded-md">
          <div className="flex items-center">
            <Link to="/" className="text-lg font-bold text-white/95 hover:text-white transition-colors">
              EVENTFLEX
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg btn-ghost"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon className="text-gray-600" size={20} />}
            </button>
            {user && <NotificationBell />}
            {user && (user.role === 'worker' || user.role === 'organizer') && (
              <Link to="/groups" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Messages">
                <FiMessageCircle size={20} />
              </Link>
            )}
            {user && (
              <Link to="/leaderboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Leaderboard">
                <span className="text-xl">🏆</span>
              </Link>
            )}
            {user ? (
              <>
                {user.role === 'worker' && (
                  <NavLink to="/jobs" className={({ isActive }) => isActive ? 'nav-link font-semibold text-primary-600' : 'nav-link'}>
                    Jobs
                  </NavLink>
                )}
                <Link to={getDashboardLink()} className="nav-link">
                  Dashboard
                </Link>
                <Link to={`/profile/${user.id}`} className="flex items-center nav-link">
                  <FiUser className="mr-1" />
                  <span className="max-w-[140px] truncate">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center nav-link">
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg btn-ghost"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon className="text-gray-600" size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            className="md:hidden border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Notification bell on mobile */}
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
                      className="block py-2 nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Jobs
                    </Link>
                  )}
                  <Link 
                    to={getDashboardLink()} 
                    className="block py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {(user.role === 'worker' || user.role === 'organizer') && (
                    <Link 
                      to="/groups" 
                      className="flex items-center py-2 nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiMessageCircle className="mr-2" />
                      Messages
                    </Link>
                  )}
                  <Link 
                    to="/leaderboard" 
                    className="flex items-center py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2 text-xl">🏆</span>
                    Leaderboard
                  </Link>
                  <Link 
                    to={`/profile/${user.id}`} 
                    className="flex items-center py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="mr-2" />
                    {user.name}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center py-2 nav-link w-full text-left"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block btn-primary text-center"
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