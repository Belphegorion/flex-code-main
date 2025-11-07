import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AdvancedSearch from '../components/search/AdvancedSearch';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { jobService } from '../services/jobService';
import api from '../services/api';

const JobsLanding = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, profileData] = await Promise.all([
        jobService.discoverJobs({ maxDistance: 50, status: 'active' }),
        api.get('/profiles/my-profile')
      ]);

      const jobsList = (jobsData.jobs || jobsData || []).filter(job => 
        job.status === 'active' || job.status === 'open'
      );
      setJobs(jobsList);
      setFilteredJobs(jobsList);
      setProfile(profileData.profile || profileData);
    } catch (error) {
      console.error('Error fetching jobs for JobsLanding:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    let filtered = jobs;
    if (filters.query) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.city?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.payMin) {
      filtered = filtered.filter(job => job.payPerPerson >= parseFloat(filters.payMin));
    }

    if (filters.payMax) {
      filtered = filtered.filter(job => job.payPerPerson <= parseFloat(filters.payMax));
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => 
        filters.skills.some(skill => 
          job.requiredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredJobs(filtered);
  };

  const handleReset = () => setFilteredJobs(jobs);

  return (
    <Layout>
      <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover Jobs</h1>
              <p className="text-gray-600 dark:text-gray-400">Find opportunities that match your skills</p>
            </div>

            <AdvancedSearch onSearch={handleSearch} onReset={handleReset} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
                            {job.eventId?.title || 'Event Job'}
                          </span>
                          {job.matchScore && (
                            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                              {job.matchScore}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <FiCheckCircle className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {job.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requiredSkills?.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              +{job.requiredSkills.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiDollarSign className="mr-2" size={14} />
                            <span>${job.payPerPerson} per person</span>
                          </div>
                          {job.location?.city && (
                            <div className="flex items-center">
                              <FiMapPin className="mr-2" size={14} />
                              <span>{job.location.city}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/jobs/${job._id}`}
                          className="block w-full text-center px-4 py-2.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
                        >
                          View template →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default JobsLanding;
