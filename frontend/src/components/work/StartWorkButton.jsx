import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlay, FiX, FiCalendar } from 'react-icons/fi';
import QRScanner from './QRScanner';
import api from '../../services/api';

export default function StartWorkButton() {
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkerEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/my-jobs');
      const jobs = res.jobs || [];
      
      // Group jobs by event
      const eventMap = {};
      jobs.forEach(job => {
        if (job.eventId && job.status === 'accepted') {
          const eventId = job.eventId._id;
          if (!eventMap[eventId]) {
            eventMap[eventId] = {
              ...job.eventId,
              jobs: []
            };
          }
          eventMap[eventId].jobs.push(job);
        }
      });
      
      setEvents(Object.values(eventMap));
    } catch (error) {
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = () => {
    setShowEventSelector(true);
    fetchWorkerEvents();
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setShowEventSelector(false);
    setShowScanner(true);
  };

  const handleQRScanSuccess = ({ qrData, jobs }) => {
    setShowScanner(false);
    
    if (jobs.length === 1) {
      handleCheckIn(qrData.token, jobs[0]._id);
    } else {
      showJobSelection(qrData.token, jobs);
    }
  };

  const showJobSelection = (qrToken, jobs) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    
    const content = document.createElement('div');
    content.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-4';
    title.textContent = 'Select Job to Start';
    
    const jobList = document.createElement('div');
    jobList.className = 'space-y-2';
    
    jobs.forEach(job => {
      const button = document.createElement('button');
      button.className = 'w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600';
      button.innerHTML = `
        <div class="font-medium">${job.title}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Rate: $${job.payPerPerson}/hour</div>
      `;
      button.onclick = () => {
        modal.remove();
        handleCheckIn(qrToken, job._id);
      };
      jobList.appendChild(button);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'w-full mt-4 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => modal.remove();
    
    content.appendChild(title);
    content.appendChild(jobList);
    content.appendChild(cancelBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  };

  const handleCheckIn = async (qrToken, jobId) => {
    try {
      const res = await api.post('/work-schedule/check-in', {
        qrToken,
        jobId
      });
      toast.success('Work started! Check-in successful.');
      // Reset state
      setSelectedEvent(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start work');
    }
  };

  return (
    <>
      <button
        onClick={handleStartWork}
        className="btn-primary flex items-center gap-2 w-full"
      >
        <FiPlay size={16} />
        Start Work Hours
      </button>

      {/* Event Selection Modal */}
      {showEventSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Select Event to Work On</h3>
              <button
                onClick={() => setShowEventSelector(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <FiCalendar className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">No active events found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You need to be hired for jobs to start work hours
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(event => (
                    <button
                      key={event._id}
                      onClick={() => handleEventSelect(event)}
                      className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(event.dateStart).toLocaleDateString()} - {event.location}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                            {event.jobs.length} job{event.jobs.length !== 1 ? 's' : ''} assigned
                          </p>
                        </div>
                        <div className="ml-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && selectedEvent && (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => {
            setShowScanner(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </>
  );
}