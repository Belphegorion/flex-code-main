import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiDollarSign, FiTrendingUp, FiCalendar, FiMapPin } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import StartWorkButton from '../components/work/StartWorkButton';
import api from '../services/api';

export default function WorkerLanding() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalHours: 0,
    activeJobs: 0,
    completedJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        api.get('/jobs/my-jobs'),
        api.get('/applications/my-applications')
      ]);
      
      const jobs = jobsRes.jobs || [];
      const applications = applicationsRes.applications || [];
      
      // Calculate stats
      const totalEarnings = jobs.reduce((sum, job) => sum + (job.totalEarnings || 0), 0);
      const totalHours = jobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
      const activeJobs = jobs.filter(job => job.status === 'in-progress').length;
      const completedJobs = applications.filter(app => app.status === 'completed').length;
      
      setStats({ totalEarnings, totalHours, activeJobs, completedJobs });
      setRecentJobs(jobs.slice(0, 3));
    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome Back, Worker! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Ready to start earning? Track your hours and manage your work seamlessly.
          </p>
          
          <motion.div 
            className="max-w-md mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <StartWorkButton />
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          variants={itemVariants}
        >
          <motion.div 
            className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
            whileHover={{ scale: 1.05 }}
          >
            <FiDollarSign className="mx-auto text-green-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ${stats.totalEarnings}
            </div>
            <div className="text-sm text-green-600 dark:text-green-500">Total Earnings</div>
          </motion.div>

          <motion.div 
            className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
            whileHover={{ scale: 1.05 }}
          >
            <FiClock className="mx-auto text-blue-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.totalHours}h
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-500">Hours Worked</div>
          </motion.div>

          <motion.div 
            className="card p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
            whileHover={{ scale: 1.05 }}
          >
            <FiTrendingUp className="mx-auto text-purple-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {stats.activeJobs}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-500">Active Jobs</div>
          </motion.div>

          <motion.div 
            className="card p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
            whileHover={{ scale: 1.05 }}
          >
            <FiCalendar className="mx-auto text-orange-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {stats.completedJobs}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-500">Completed</div>
          </motion.div>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div 
          className="card p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold mb-6">Your Recent Jobs</h2>
          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-4">No jobs yet</p>
              <button className="btn-primary">Find Work</button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center font-bold">
                      {job.eventId?.title?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiMapPin size={14} />
                          {job.eventId?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          {new Date(job.eventId?.dateStart).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${job.payPerPerson}/hr</div>
                    <div className="text-sm text-gray-500 capitalize">{job.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          variants={itemVariants}
        >
          <motion.button 
            className="card p-6 text-center hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCalendar className="mx-auto text-primary-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">My Schedule</h3>
            <p className="text-sm text-gray-600">View upcoming work sessions</p>
          </motion.button>

          <motion.button 
            className="card p-6 text-center hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiDollarSign className="mx-auto text-green-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Earnings</h3>
            <p className="text-sm text-gray-600">Track your income</p>
          </motion.button>

          <motion.button 
            className="card p-6 text-center hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrendingUp className="mx-auto text-blue-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Find Work</h3>
            <p className="text-sm text-gray-600">Discover new opportunities</p>
          </motion.button>
        </motion.div>
      </motion.div>
    </Layout>
  );
}