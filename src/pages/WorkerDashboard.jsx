import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import WorkerBadgeCard from '../components/badges/WorkerBadgeCard';
import AadhaarUpload from '../components/documents/AadhaarUpload';
import { FiDollarSign, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import api from '../services/api';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchAcceptedJobs();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await api.get('/profiles/my-profile');
      setProfile(profileData.profile || profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchAcceptedJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setAcceptedJobs(res.jobs || []);
    } catch (error) {
      console.error('Error fetching accepted jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // dashboard actions handled below; job search UI was moved to dedicated JobsLanding page

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

              <div className="card p-6 mb-6">
                <h2 className="text-lg font-medium mb-2">My Active Jobs ({acceptedJobs.length})</h2>
                {acceptedJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <FiCalendar className="mx-auto text-gray-400 mb-3" size={36} />
                    <p className="text-gray-500">No active jobs yet</p>
                    <div className="mt-4">
                      <button onClick={() => navigate('/jobs')} className="btn-primary">Find Work</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedJobs.map(job => (
                      <div key={job._id} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{job.title}</h3>
                          <span className="text-green-600 font-bold">${job.payPerPerson}/hr</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.eventId?.title}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1"><FiCalendar size={14}/>{new Date(job.eventId?.dateStart).toLocaleDateString()}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiClock className="text-blue-600"/> My Applications ({applications.length})</h2>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-4">No applications yet</p>
                    <button onClick={() => navigate('/jobs')} className="btn-primary">Find Work</button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {applications.map(application => (
                      <div key={application._id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{application.jobId?.title}</h3>
                          <div className="flex items-center gap-2">
                            {application.status === 'accepted' ? <FiCheckCircle className="text-green-500"/> : application.status === 'rejected' ? <FiXCircle className="text-red-500"/> : <FiClock className="text-yellow-500"/>}
                            <span className={`px-2 py-1 rounded-full text-xs border ${application.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : application.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{application.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{application.jobId?.eventId?.title}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                          <span className="font-medium">${application.jobId?.payPerPerson}/hr</span>
                        </div>
                        {application.coverLetter && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"><strong>Cover Letter:</strong> {application.coverLetter}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <aside className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
              <WorkerBadgeCard />
              {profile && <ProfileCompleteness profile={profile} />}
              
              {/* Document Upload Section */}
              <div className="mt-6">
                <AadhaarUpload onUploadComplete={() => { fetchProfile(); fetchApplications(); fetchAcceptedJobs(); }} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="card text-center">
                  <FiDollarSign className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
                  <p className="text-xl font-bold">$0</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Earnings</p>
                </div>
                <div className="card text-center col-span-2">
                  <FiMapPin className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
                  <p className="text-xl font-bold">{profile?.userId?.completedJobsCount || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Jobs Completed</p>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WorkerDashboard;
