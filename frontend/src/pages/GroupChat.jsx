import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSend, FiUsers, FiArrowLeft, FiUserPlus, FiX, FiSettings, FiUserMinus, FiUserCheck, FiHash, FiClock } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import GroupScheduler from '../components/groups/GroupScheduler';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import socketService from '../services/socket';

export default function GroupChat() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroup();
    socketService.joinGroup(groupId);

    socketService.onGroupMessage((data) => {
      if (data.groupId === groupId) {
        if (data.qrCode && data.message) {
          // Handle QR code display in real-time
          setGroup(prev => {
            if (!prev) return prev;
            const updatedMessages = [...prev.messages];
            // Add the new message with QR code
            const messageWithQR = { ...data.message, qrCode: data.qrCode };
            updatedMessages.push(messageWithQR);
            return { ...prev, messages: updatedMessages };
          });
        } else {
          fetchGroup();
        }
      }
    });

    return () => socketService.offGroupMessage();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [group?.messages]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroup(res.group || res);
    } catch (error) {
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.post(`/groups/${groupId}/message`, { text: message });
      setMessage('');
      fetchGroup();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchWorkers = async () => {
    try {
      // Get all jobs for this event
      const res = await api.get(`/events/${group.eventId._id}/jobs`);
      const jobs = res.jobs || [];
      
      // Get all hired workers from all jobs
      const acceptedWorkers = [];
      for (const job of jobs) {
        if (job.hiredPros) {
          job.hiredPros.forEach(worker => {
            if (!acceptedWorkers.some(w => w._id === worker._id) && 
                !group.participants.some(p => p._id === worker._id)) {
              acceptedWorkers.push(worker);
            }
          });
        }
      }
      setWorkers(acceptedWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleAddMember = async (workerId) => {
    setAddingMember(true);
    try {
      await api.post(`/groups/${groupId}/members`, { userIds: [workerId] });
      toast.success('Member added successfully!');
      setShowAddMember(false);
      setSearchQuery('');
      setSelectedWorkers([]);
      fetchGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleBulkAdd = async () => {
    if (selectedWorkers.length === 0) {
      toast.error('Please select at least one worker');
      return;
    }
    setAddingMember(true);
    try {
      await api.post(`/groups/${groupId}/members`, { userIds: selectedWorkers });
      toast.success(`${selectedWorkers.length} member(s) added successfully!`);
      setShowAddMember(false);
      setSearchQuery('');
      setSelectedWorkers([]);
      fetchGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setAddingMember(false);
    }
  };

  const toggleWorkerSelection = (workerId) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      toast.success('Member removed successfully');
      fetchGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    if (!window.confirm('Are you sure you want to transfer group ownership? You will lose admin privileges.')) return;
    
    try {
      await api.put(`/groups/${groupId}/transfer`, { newOwnerId });
      toast.success('Ownership transferred successfully');
      fetchGroup();
      setShowGroupSettings(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer ownership');
    }
  };

  const openAddMemberModal = () => {
    fetchWorkers();
    setShowAddMember(true);
  };

  const shareWorkQR = async () => {
    try {
      await api.post(`/groups/${groupId}/share-work-qr`);
      toast.success('Work QR code shared in group');
      fetchGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share QR code');
    }
  };

  const isOrganizer = user?.role === 'organizer' && group?.createdBy === user?.id;

  const filteredWorkers = workers.filter(worker =>
    worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card p-12 text-center">
            <p className="text-gray-500">Group not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 dark:bg-primary-700 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => window.history.back()}
              className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex-shrink-0"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              {group.name?.charAt(0) || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{group.name}</h2>
              <p className="text-xs opacity-90 truncate">{group.participants?.length} members • {group.eventId?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOrganizer && (
              <>
                <button
                  onClick={() => setShowScheduler(true)}
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
                  title="Schedule Session"
                >
                  <FiHash size={20} />
                </button>
                <button
                  onClick={shareWorkQR}
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
                  title="Share Work QR"
                >
                  <FiClock size={20} />
                </button>
                <button
                  onClick={openAddMemberModal}
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
                  title="Add Member"
                >
                  <FiUserPlus size={20} />
                </button>
                <button
                  onClick={() => setShowGroupSettings(true)}
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
                  title="Group Settings"
                >
                  <FiSettings size={20} />
                </button>
              </>
            )}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <FiUsers size={20} />
              <span className="text-sm hidden sm:inline">Members</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              {group.messages?.map((msg, idx) => {
                const isOwn = msg.senderId?._id === user?.id || msg.senderId === user?.id;
                const isSystem = msg.type === 'system';
                
                if (isSystem) {
                  return (
                    <div key={idx} className="flex justify-center">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      isOwn
                        ? 'bg-primary-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md'
                    } p-3 shadow-md relative`}>
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 text-primary-600 dark:text-primary-400">
                          {msg.senderId?.name || 'Unknown'}
                        </p>
                      )}
                      <p className="break-words text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      
                      {/* Display QR code if message contains work QR */}
                      {msg.text.includes('Work Hours QR Code') && msg.qrCode && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-2 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                              {msg.qrCode ? (
                                <img 
                                  src={msg.qrCode} 
                                  alt="Work Hours QR Code" 
                                  className="w-full h-full object-contain"
                                  onClick={() => {
                                    // Create safe modal without innerHTML
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
                                    
                                    const modalContent = document.createElement('div');
                                    modalContent.className = 'bg-white rounded-lg p-6 max-w-sm w-full text-center';
                                    
                                    const img = document.createElement('img');
                                    img.src = msg.qrCode;
                                    img.alt = 'Work Hours QR Code';
                                    img.className = 'w-full mb-4';
                                    
                                    const text = document.createElement('p');
                                    text.className = 'text-sm text-gray-600 mb-4';
                                    text.textContent = 'Scan to track work hours';
                                    
                                    const button = document.createElement('button');
                                    button.className = 'bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700';
                                    button.textContent = 'Close';
                                    button.onclick = () => modal.remove();
                                    
                                    modalContent.appendChild(img);
                                    modalContent.appendChild(text);
                                    modalContent.appendChild(button);
                                    modal.appendChild(modalContent);
                                    document.body.appendChild(modal);
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-gray-500">Loading QR...</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Scan to track work hours</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isOwn && (
                          <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-full bg-white dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500 transition-all"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className={`p-3 rounded-full transition-all transform ${
                    message.trim() 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-110' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!message.trim()}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <div className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 overflow-y-auto">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-lg">Members</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{group.participants?.length} participants</p>
              </div>
              <div className="p-4 space-y-3">
                {group.participants?.map(member => (
                  <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Group Settings Modal */}
        {showGroupSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">Group Settings</h3>
                <button
                  onClick={() => setShowGroupSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Manage Members</h4>
                  <div className="space-y-2">
                    {group.participants?.map(member => (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {member._id === group.createdBy ? 'Owner' : member.role}
                          </p>
                        </div>
                        {member._id !== group.createdBy && member._id !== user?.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTransferOwnership(member._id)}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="Transfer Ownership"
                            >
                              <FiUserCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              title="Remove Member"
                            >
                              <FiUserMinus size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">Add Member</h3>
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b dark:border-gray-700">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workers..."
                  className="input-field"
                  autoFocus
                />
              </div>

              {/* Workers List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredWorkers.length === 0 ? (
                  <div className="text-center py-8">
                    <FiUsers className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">
                      {searchQuery ? 'No workers found' : 'All accepted workers are already in the group'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {filteredWorkers.map(worker => (
                        <div
                          key={worker._id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkers.includes(worker._id)}
                            onChange={() => toggleWorkerSelection(worker._id)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
                            {worker.name?.charAt(0) || 'W'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{worker.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{worker.email}</p>
                          </div>
                          <button
                            onClick={() => handleAddMember(worker._id)}
                            disabled={addingMember}
                            className="btn-secondary text-sm px-3 py-1"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                    {selectedWorkers.length > 0 && (
                      <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedWorkers.length} worker(s) selected
                        </span>
                        <button
                          onClick={handleBulkAdd}
                          disabled={addingMember}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          {addingMember ? 'Adding...' : `Add ${selectedWorkers.length}`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {showScheduler && (
          <GroupScheduler
            groupId={groupId}
            onClose={() => setShowScheduler(false)}
            onScheduled={() => {
              setShowScheduler(false);
              fetchGroup();
            }}
          />
        )}
      </div>
    </Layout>
  );
}
