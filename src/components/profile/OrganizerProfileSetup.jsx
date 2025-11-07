import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiBriefcase, FiGlobe, FiFileText } from 'react-icons/fi';
import api from '../../services/api';

export default function OrganizerProfileSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/profile-setup/organizer', formData);
      onComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error completing profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiBriefcase /> Company/Organization Name
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          placeholder="Your company name"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Industry</label>
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="e.g., Corporate Events, Weddings, Conferences"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiGlobe /> Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://yourwebsite.com"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiFileText /> About Your Organization
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about your organization and the types of events you organize..."
          rows={4}
          maxLength={500}
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Completing...' : 'Complete Profile'}
      </button>
    </form>
  );
}
