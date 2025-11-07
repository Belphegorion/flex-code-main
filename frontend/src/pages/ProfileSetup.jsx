import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Layout from '../components/common/Layout';
import WorkerProfileSetup from '../components/profile/WorkerProfileSetup';
import OrganizerProfileSetup from '../components/profile/OrganizerProfileSetup';
import SponsorProfileSetup from '../components/profile/SponsorProfileSetup';
import { FiCheckCircle } from 'react-icons/fi';

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState(null);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const res = await api.get('/profile-setup/status');
      setProfileStatus(res);
      if (res.profileCompleted) {
        navigate(getDashboardRoute());
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = () => {
    if (user?.role === 'worker') return '/worker';
    if (user?.role === 'organizer') return '/organizer';
    if (user?.role === 'sponsor') return '/sponsor';
    return '/';
  };

  const handleComplete = async () => {
    toast.success('Profile completed successfully!');
    updateUser({ profileCompleted: true });
    navigate(getDashboardRoute());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <FiCheckCircle className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Let's set up your profile to get you started
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            {user?.role === 'worker' && (
              <WorkerProfileSetup onComplete={handleComplete} />
            )}
            {user?.role === 'organizer' && (
              <OrganizerProfileSetup onComplete={handleComplete} />
            )}
            {user?.role === 'sponsor' && (
              <SponsorProfileSetup onComplete={handleComplete} />
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
