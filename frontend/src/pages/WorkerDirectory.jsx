import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiStar, FiMessageCircle, FiBriefcase, FiMapPin } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function WorkerDirectory() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    location: '',
    minRating: '',
    availability: ''
  });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showJobSelect, setShowJobSelect] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    searchWorkers();
    fetchMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs');
      // assuming api is axios-like
      const data = res?.data || res;
      setJobs(data.jobs || data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs. Please try again.');
      setJobs([]);
    }
  };

  const searchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await api.get(`/worker-directory/search?${params.toString()}`);
      const data = res?.data || res;
      // support both { workers: [...] } and direct array return
      setWorkers(data.workers || data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (worker) => {
    setSelectedWorker(worker);
    setShowChat(true);
    try {
      const res = await api.get(`/worker-directory/conversation/${worker._id}`);
      const data = res?.data || res;
      setConversation(data.conversation?.messages || data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConversation([]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedWorker) return;

    try {
      await api.post('/worker-directory/message', {
        workerId: selectedWorker._id,
        text: message
      });

      setConversation(prev => [...prev, { senderId: 'me', text: message, createdAt: new Date().toISOString() }]);
      setMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }
  };

  const openJobSelect = (worker) => {
    setSelectedWorker(worker);
    setShowJobSelect(true);
  };

  const sendJobOffer = async (jobId) => {
    if (!jobId) {
      toast.error('Please select a job');
      return;
    }

    try {
      await api.post('/worker-directory/offer', {
        workerId: selectedWorker._id,
        jobId,
        message: 'I would like to offer you this position'
      });
      toast.success('Job offer sent!');
      setShowJobSelect(false);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to send offer');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Worker Directory</h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />

              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />

              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />

              <select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>

              <button
                type="button"
                onClick={searchWorkers}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <FiSearch />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Workers Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker, idx) => (
                <motion.div
                  key={worker._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={worker.profilePhoto || '/default-avatar.png'}
                        alt={worker.name || 'Worker'}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-100 dark:ring-indigo-900/30"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{worker.name || 'Unnamed'}</h3>

                      {(worker.ratingAvg ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar />
                          <span className="font-medium">{(Number(worker.ratingAvg) || 0).toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({worker.ratingCount ?? 0})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {worker.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{worker.bio}</p>
                  )}

                  {Array.isArray(worker.skills) && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {worker.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {worker.location?.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <FiMapPin size={14} />
                      <span>{worker.location.city}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openChat(worker)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle />
                      <span>Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openJobSelect(worker)}
                      className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                      <FiBriefcase />
                      <span>Offer</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Job Selection Modal */}
          {showJobSelect && selectedWorker && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Select Job to Offer</h3>

                  {jobs.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No jobs available. Create a job first.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                      {jobs.map((job) => (
                        <button
                          key={job._id}
                          type="button"
                          onClick={() => sendJobOffer(job._id)}
                          className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="font-semibold text-gray-900 dark:text-white">{job.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{job.payPerPerson ? `$${job.payPerPerson}/person` : 'Payment TBD'} • {job.location?.city || job.location?.address || 'Location TBD'}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => setShowJobSelect(false)} className="w-full px-4 py-2 rounded-lg border">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          {showChat && selectedWorker && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedWorker.profilePhoto || '/default-avatar.png'}
                      alt={selectedWorker.name || 'Worker'}
                      className="w-10 h-10 rounded-full"
                    />
                    <h3 className="font-semibold">{selectedWorker.name || 'Unnamed'}</h3>
                  </div>

                  <button type="button" onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === 'me' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                    />

                    <button type="button" onClick={sendMessage} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
