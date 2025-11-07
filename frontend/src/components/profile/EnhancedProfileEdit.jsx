import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiLink } from 'react-icons/fi';
import api from '../../services/api';

export default function EnhancedProfileEdit() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    location: { city: '', state: '', country: '' },
    socialLinks: { linkedin: '', twitter: '', portfolio: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles/me');
      const { user } = res;
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || { city: '', state: '', country: '' },
        socialLinks: user.socialLinks || { linkedin: '', twitter: '', portfolio: '' }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profiles/me', formData);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="input-field"
          rows="4"
          maxLength="500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            value={formData.location.city}
            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <input
            type="text"
            value={formData.location.state}
            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <input
            type="text"
            value={formData.location.country}
            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiLink /> Social Links
        </label>
        <div className="space-y-3">
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={formData.socialLinks.linkedin}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
            className="input-field"
          />
          <input
            type="url"
            placeholder="Twitter URL"
            value={formData.socialLinks.twitter}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
            className="input-field"
          />
          <input
            type="url"
            placeholder="Portfolio URL"
            value={formData.socialLinks.portfolio}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value } })}
            className="input-field"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
        <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
