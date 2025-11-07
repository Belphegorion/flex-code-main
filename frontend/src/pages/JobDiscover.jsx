import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiUsers, FiStar } from 'react-icons/fi';
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Discover Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400">Find your next opportunity from available positions</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Finding perfect matches...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiBriefcase className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No jobs available</h2>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1 transition-all duration-300"
              >
                {job.matchScore && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                      <FiStar size={14} />
                      {job.matchScore}% Match
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{job.title}</h3>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin size={16} className="flex-shrink-0" />
                    <span>{job.location?.city || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                    <FiDollarSign size={16} className="flex-shrink-0" />
                    <span>${job.payPerPerson} per person</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiClock size={16} className="flex-shrink-0" />
                    <span>{new Date(job.dateStart).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiUsers size={16} className="flex-shrink-0" />
                    <span>{job.positionsFilled || 0}/{job.totalPositions} positions filled</span>
                  </div>
                </div>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mb-5">
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                          +{job.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="block w-full text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
