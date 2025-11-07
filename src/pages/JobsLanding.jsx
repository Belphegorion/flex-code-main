import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import JobCard from '../components/common/JobCard';
import AdvancedSearch from '../components/search/AdvancedSearch';
import { FiBriefcase } from 'react-icons/fi';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-6">Find Work</h1>

          <AdvancedSearch onSearch={handleSearch} onReset={handleReset} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="relative"
                >
                  <JobCard job={job} showMatchScore userLocation={profile?.location} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No jobs available at the moment</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default JobsLanding;
