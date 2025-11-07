import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import { FiBriefcase, FiMapPin, FiDollarSign, FiUsers, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import LocationPicker from '../components/events/LocationPicker';

const JobCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    dateStart: '',
    dateEnd: '',
    location: null,
    payPerPerson: '',
    totalPositions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }
    
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
        payPerPerson: Number(formData.payPerPerson),
        totalPositions: Number(formData.totalPositions),
        location: {
          address: formData.location.address,
          city: formData.location.address.split(',')[0] || '',
          state: '',
          lat: formData.location.lat,
          lng: formData.location.lng
        }
      };

      await api.post('/jobs', jobData);
      toast.success('Job posted successfully!');
      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiBriefcase className="inline mr-2" />
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Event Setup Crew"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Describe the job requirements..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Required Skills (comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Setup, Audio, Lighting"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <FiCalendar className="inline mr-2" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <FiCalendar className="inline mr-2" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiMapPin className="inline mr-2" />
              Location *
            </label>
            <LocationPicker
              value={formData.location}
              onChange={(location) => setFormData(prev => ({ ...prev, location }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <FiDollarSign className="inline mr-2" />
                Pay Per Person
              </label>
              <input
                type="number"
                name="payPerPerson"
                value={formData.payPerPerson}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 150"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <FiUsers className="inline mr-2" />
                Total Positions
              </label>
              <input
                type="number"
                name="totalPositions"
                value={formData.totalPositions}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 5"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/organizer')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </Layout>
  );
};

export default JobCreate;
