import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiBriefcase, FiGlobe, FiDollarSign, FiTag, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';

export default function SponsorProfileSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    sponsorshipBudget: '',
    interestedCategories: []
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addCategory = () => {
    if (categoryInput.trim() && !formData.interestedCategories.includes(categoryInput.trim())) {
      setFormData({ ...formData, interestedCategories: [...formData.interestedCategories, categoryInput.trim()] });
      setCategoryInput('');
    }
  };

  const removeCategory = (category) => {
    setFormData({ ...formData, interestedCategories: formData.interestedCategories.filter(c => c !== category) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName) {
      toast.error('Company name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile-setup/sponsor', formData);
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
          <FiBriefcase /> Company Name *
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          placeholder="Your company name"
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Industry</label>
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="e.g., Technology, Finance, Healthcare"
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
          placeholder="https://yourcompany.com"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiDollarSign /> Annual Sponsorship Budget
        </label>
        <input
          type="number"
          value={formData.sponsorshipBudget}
          onChange={(e) => setFormData({ ...formData, sponsorshipBudget: e.target.value })}
          placeholder="50000"
          min="0"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiTag /> Interested Event Categories
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            placeholder="e.g., Sports, Music, Tech Conferences"
            className="input-field flex-1"
          />
          <button type="button" onClick={addCategory} className="btn-primary">
            <FiPlus />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interestedCategories.map((category) => (
            <span key={category} className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm flex items-center gap-2">
              {category}
              <button type="button" onClick={() => removeCategory(category)} className="hover:text-red-600">
                <FiX size={16} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Completing...' : 'Complete Profile'}
      </button>
    </form>
  );
}
