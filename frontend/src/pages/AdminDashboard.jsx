import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import { FiUsers, FiBriefcase, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, transactions: 0, issues: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch admin stats
      setStats({ users: 0, jobs: 0, transactions: 0, issues: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiUsers} label="Total Users" value={stats.users} color="primary" delay={0} />
          <StatCard icon={FiBriefcase} label="Total Jobs" value={stats.jobs} color="success" delay={0.1} />
          <StatCard icon={FiDollarSign} label="Transactions" value={stats.transactions} color="info" delay={0.2} />
          <StatCard icon={FiAlertCircle} label="Issues" value={stats.issues} color="danger" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="text-center py-8">
              <FiUsers className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400">No recent users</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Pending Issues</h2>
            <div className="text-center py-8">
              <FiAlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400">No pending issues</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">API Server</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Payment Gateway</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                Operational
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
