import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import api from '../services/api';

const JobDiscover = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/discover');
      setJobs(res.jobs || res || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Jobs</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Finding perfect matches...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12">
            <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No jobs available</h2>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:shadow-xl transition-shadow"
              >
                {job.matchScore && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm font-medium">
                      {job.matchScore}% Match
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiMapPin size={16} />
                    <span>{job.location?.city || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign size={16} />
                    <span>${job.payPerPerson} per person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock size={16} />
                    <span>{new Date(job.dateStart).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills?.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {job.positionsFilled || 0}/{job.totalPositions} filled
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobDiscover;
