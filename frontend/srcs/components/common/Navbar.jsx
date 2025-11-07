import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { FiLogOut, FiUser, FiMoon, FiSun, FiMenu, FiX, FiEdit } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              FlexCode
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon className="text-gray-600" size={20} />}
            </button>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="nav-link">
                  Dashboard
                </Link>
                <Link to={`/profile/${user.id}`} className="flex items-center nav-link">
                  <FiUser className="mr-1" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <Link to="/profile/edit" className="flex items-center nav-link">
                  <FiEdit className="mr-1" />
                  Edit Profile
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="mr-2" />
                    {user.name}
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="flex items-center py-2 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiEdit className="mr-2" />
                    Edit Profile
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
