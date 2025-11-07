import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(formData);
      toast.success('Login successful!');
      
      // Check if profile is completed
      const profileStatus = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/profile-setup/status`, {
        headers: { 'Authorization': `Bearer ${data.accessToken}` }
      }).then(res => res.json());
      
      if (!profileStatus.profileCompleted) {
        navigate('/profile-setup');
        return;
      }
      
  // Navigate based on role
  if (data.user.role === 'worker') navigate('/jobs');
      else if (data.user.role === 'organizer') navigate('/organizer');
      else if (data.user.role === 'sponsor') navigate('/sponsor');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full btn-primary"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;