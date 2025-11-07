import api from './api';

export const jobService = {
  createJob: (jobData) => api.post('/jobs', jobData),
  getJobs: (filters) => api.get('/jobs', { params: filters }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  discoverJobs: (filters) => api.get('/jobs/discover', { params: filters }),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  hirePro: (id, proIds) => api.post(`/jobs/${id}/hire`, { proIds }),
  applyToJob: (id, coverLetter) => api.post(`/applications/${id}/apply`, { coverLetter }),
  getMyApplications: () => api.get('/applications/my-applications')
};