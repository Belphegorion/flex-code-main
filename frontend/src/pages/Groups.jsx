import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageCircle, FiSearch, FiHash } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import QRScanner from '../components/groups/QRScanner';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRSuccess = (group) => {
    fetchGroups();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const filteredGroups = groups.filter(group => 
    group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.eventId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Messages</h1>
              {user?.role === 'worker' && (
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl transition-all"
                  title="Join Group via QR"
                >
                  <FiHash size={22} />
                </button>
              )}
              {user?.role === 'sponsor' && (
                <span className="text-sm opacity-75">Sponsorship Chats</span>
              )}
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FiMessageCircle className="text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg font-medium">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchQuery ? 'No results found' : 'Start a conversation by accepting a job application'}
                </p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {filteredGroups.map((group, idx) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/groups/${group._id}`}
                      className="flex items-center gap-4 p-5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700/50 dark:hover:to-gray-700/30 transition-all"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                          {group.name?.charAt(0) || 'G'}
                        </div>
                        {group.lastMessageAt && new Date() - new Date(group.lastMessageAt) < 3600000 && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full shadow-md"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{group.name}</h3>
                          {group.lastMessageAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {formatTime(group.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                          {group.eventId?.title}
                        </p>
                        {group.lastMessage ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
                            <FiMessageCircle size={12} className="flex-shrink-0" />
                            <span className="truncate">{group.lastMessage}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No messages yet</p>
                        )}
                      </div>

                      {/* Unread Badge (placeholder for future) */}
                      {/* <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                      </div> */}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
      
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onSuccess={handleQRSuccess}
        />
      )}
    </Layout>
  );
}
