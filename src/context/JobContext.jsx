import { createContext, useState } from 'react';
import { jobService } from '../services/jobService';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);

  const fetchJobs = async (filters = {}) => {
    const data = await jobService.getJobs(filters);
    setJobs(data.jobs);
    return data.jobs;
  };

  const fetchJobById = async (id) => {
    const data = await jobService.getJobById(id);
    setCurrentJob(data.job);
    return data.job;
  };

  const createJob = async (jobData) => {
    const data = await jobService.createJob(jobData);
    setJobs([data.job, ...jobs]);
    return data.job;
  };

  const discoverJobs = async (filters = {}) => {
    const data = await jobService.discoverJobs(filters);
    return data.jobs;
  };

  return (
    <JobContext.Provider value={{
      jobs,
      currentJob,
      fetchJobs,
      fetchJobById,
      createJob,
      discoverJobs,
      setCurrentJob
    }}>
      {children}
    </JobContext.Provider>
  );
};