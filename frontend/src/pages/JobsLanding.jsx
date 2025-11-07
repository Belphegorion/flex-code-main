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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Discover Jobs</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find opportunities that match your skills</p>
            </div>

            <AdvancedSearch onSearch={handleSearch} onReset={handleReset} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <div className="h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                            {job.roles?.[0] || 'General'}
                          </span>
                          {job.matchScore && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{job.matchScore}% match</span>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <FiCheckCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                              {job.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-6">
                            {job.description}
                          </p>
                        </div>

                        <div className="space-y-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <FiDollarSign size={14} className="text-gray-400" />
                            <span>${job.payPerPerson} per person</span>
                          </div>
                          {job.location?.city && (
                            <div className="flex items-center gap-2">
                              <FiMapPin size={14} className="text-gray-400" />
                              <span>{job.location.city}</span>
                            </div>
                          )}
                        </div>

                        {job.requiredSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.requiredSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <Link
                          to={`/jobs/${job._id}`}
                          className="block w-full text-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm rounded transition-colors"
                        >
                          View template
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <FiBriefcase className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No jobs found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
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
