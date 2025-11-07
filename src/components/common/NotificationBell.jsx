import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socketService from '../../services/socket';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    socketService.onNotification(() => {
      fetchNotifications();
      fetchUnreadCount();
    });

    return () => socketService.offNotification();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await api.put(`/notifications/${notification._id}/read`);
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
      setShowDropdown(false);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-8 text-gray-500 text-center">No notifications</p>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                        {notif.type === 'qr_code' && (
                          <div className="text-primary-600 dark:text-primary-400 mt-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 11V3h8v8H3zm2-2h4V5H5v4zm8-6h8v8h-8V3zm2 2v4h4V5h-4zM3 21v-8h8v8H3zm2-2h4v-4H5v4zm8-2h2v2h-2v-2zm0-2h2v2h-2v-2zm2 0h2v2h-2v-2zm0 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 0h2v2h-2v-2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
