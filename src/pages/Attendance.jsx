import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import { FiCheckCircle, FiMapPin, FiClock, FiLoader } from 'react-icons/fi';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';

const Attendance = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.job || res);
    } catch (error) {
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (type) => {
    setCheckingIn(true);
    try {
      let location = null;
      try {
        location = await getCurrentPosition();
        toast.info('Location detected automatically');
      } catch (error) {
        toast.warning('Location detection failed, proceeding without location');
      }
      
      await api.post('/applications/check-in', { jobId, type, location });
      toast.success(`${type === 'check-in' ? 'Checked in' : 'Checked out'} successfully!`);
      fetchJob();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Attendance</h1>

        {job && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-semibold mb-4">{job.title}</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiMapPin />
                <span>{job.location?.city}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiClock />
                <span>{new Date(job.dateStart).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                <p className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <FiMapPin /> Your location will be automatically detected when you check in/out
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleCheckIn('check-in')}
                  className="btn-primary flex-1"
                  disabled={checkingIn}
                >
                  {checkingIn ? <FiLoader className="inline mr-2 animate-spin" /> : <FiCheckCircle className="inline mr-2" />}
                  Check In
                </button>
                <button
                  onClick={() => handleCheckIn('check-out')}
                  className="btn-secondary flex-1"
                  disabled={checkingIn}
                >
                  {checkingIn ? <FiLoader className="inline mr-2 animate-spin" /> : <FiCheckCircle className="inline mr-2" />}
                  Check Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
