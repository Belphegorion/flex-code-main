import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCalendar, FiUsers, FiDollarSign, FiMapPin, FiClock } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';

export default function SponsorLanding() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    dateFrom: '',
    minBudget: '',
    maxBudget: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/discover');
      setEvents(res.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsor = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/sponsor`);
      toast.success('Sponsorship request sent!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to send sponsorship request');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Events to Sponsor 🎯
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Connect with amazing events and grow your brand visibility
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="card p-6 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-lg font-bold mb-4">Filter Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="input-field"
            />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Min Budget"
              value={filters.minBudget}
              onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max Budget"
              value={filters.maxBudget}
              onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
              className="input-field"
            />
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No events available for sponsorship</p>
            </div>
          ) : (
            events.map((event, idx) => (
              <motion.div
                key={event._id}
                className="card overflow-hidden hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                  {event.title?.charAt(0) || 'E'}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin size={14} />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar size={14} />
                      {new Date(event.dateStart).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiUsers size={14} />
                      {event.expectedAttendees || 'TBD'} expected attendees
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiDollarSign size={14} />
                      Budget: ${event.budget || 'Negotiable'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                        {event.organizerId?.name?.charAt(0) || 'O'}
                      </div>
                      <span className="text-sm text-gray-600">{event.organizerId?.name}</span>
                    </div>
                    
                    <motion.button
                      onClick={() => handleSponsor(event._id)}
                      className="btn-primary text-sm px-4 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sponsor Event
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Sponsorship Benefits */}
        <motion.div 
          className="card p-8 mt-12 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Why Sponsor Events?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FiTrendingUp className="mx-auto text-primary-600 mb-4" size={48} />
              <h3 className="font-bold mb-2">Brand Visibility</h3>
              <p className="text-gray-600">Increase your brand awareness among target audiences</p>
            </div>
            <div className="text-center">
              <FiUsers className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="font-bold mb-2">Network Growth</h3>
              <p className="text-gray-600">Connect with event organizers and attendees</p>
            </div>
            <div className="text-center">
              <FiDollarSign className="mx-auto text-green-600 mb-4" size={48} />
              <h3 className="font-bold mb-2">ROI Tracking</h3>
              <p className="text-gray-600">Measure the impact of your sponsorship investments</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}