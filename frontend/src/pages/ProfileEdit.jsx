import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import PhotoUpload from '../components/profile/PhotoUpload';
import EnhancedProfileEdit from '../components/profile/EnhancedProfileEdit';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function ProfileEdit() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    tagline: '',
    skills: [],
    location: { city: '', state: '', country: '', zipCode: '' },
    availability: 'flexible',
    hourlyRate: '',
    yearsOfExperience: '',
    languages: [],
    socialLinks: { linkedin: '', twitter: '', github: '', portfolio: '', website: '' },
    preferences: {
      jobTypes: [],
      travelWillingness: 'local',
      remoteWork: false,
      teamSize: 'any'
    }
  });
  const [languageInput, setLanguageInput] = useState({ language: '', proficiency: 'conversational' });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles/me');
      const userData = res.user || res;
      const profileData = res.profile || {};
      
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        bio: profileData.bio || '',
        tagline: profileData.tagline || '',
        skills: profileData.skills || [],
        location: profileData.location || { city: '', state: '', country: '', zipCode: '' },
        availability: profileData.availability || 'flexible',
        hourlyRate: profileData.hourlyRate || '',
        yearsOfExperience: profileData.yearsOfExperience || '',
        languages: profileData.languages || [],
        socialLinks: profileData.socialLinks || { linkedin: '', twitter: '', github: '', portfolio: '', website: '' },
        preferences: profileData.preferences || {
          jobTypes: [],
          travelWillingness: 'local',
          remoteWork: false,
          teamSize: 'any'
        }
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/profiles/me', formData);
      toast.success('Profile updated successfully!');
      updateUser({ name: formData.name, phone: formData.phone });
      navigate(`/profile/${user.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLanguage = () => {
    if (languageInput.language.trim()) {
      setFormData({ ...formData, languages: [...formData.languages, languageInput] });
      setLanguageInput({ language: '', proficiency: 'conversational' });
    }
  };

  const removeLanguage = (index) => {
    setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

          <div className="card p-8">
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('professional')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'professional'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'social'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Social & Links
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'preferences'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Preferences
              </button>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
              <PhotoUpload 
                currentPhoto={user?.profilePhoto}
                onUploadSuccess={(url) => updateUser({ profilePhoto: url })}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'basic' && (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  maxLength={100}
                  className="input-field"
                  placeholder="e.g., Experienced Event Coordinator | 5+ Years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  maxLength={1500}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1500</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                    placeholder="City"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                    placeholder="State"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                    placeholder="Country"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={formData.location.zipCode}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, zipCode: e.target.value } })}
                    placeholder="Zip Code"
                    className="input-field"
                  />
                </div>
              </div>
                </>
              )}

              {activeTab === 'professional' && (
                <>
              {user?.role === 'worker' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill"
                        className="input-field flex-1"
                      />
                      <button type="button" onClick={addSkill} className="btn-primary">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="input-field"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="weekends">Weekends Only</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      placeholder="e.g., 5"
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Languages</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={languageInput.language}
                        onChange={(e) => setLanguageInput({ ...languageInput, language: e.target.value })}
                        placeholder="Language"
                        className="input-field flex-1"
                      />
                      <select
                        value={languageInput.proficiency}
                        onChange={(e) => setLanguageInput({ ...languageInput, proficiency: e.target.value })}
                        className="input-field w-40"
                      >
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                      <button type="button" onClick={addLanguage} className="btn-primary">
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.languages.map((lang, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm">{lang.language} - {lang.proficiency}</span>
                          <button type="button" onClick={() => removeLanguage(i)} className="text-red-600 hover:text-red-700">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
                </>
              )}

              {activeTab === 'social' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub</label>
                    <input
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                      placeholder="https://github.com/yourusername"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Portfolio</label>
                    <input
                      type="url"
                      value={formData.socialLinks.portfolio}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value } })}
                      placeholder="https://yourportfolio.com"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.socialLinks.website}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                      placeholder="https://yourwebsite.com"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                      placeholder="https://twitter.com/yourusername"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {activeTab === 'preferences' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Travel Willingness</label>
                    <select
                      value={formData.preferences.travelWillingness}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, travelWillingness: e.target.value } })}
                      className="input-field"
                    >
                      <option value="no">No Travel</option>
                      <option value="local">Local Only</option>
                      <option value="regional">Regional</option>
                      <option value="national">National</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Team Size</label>
                    <select
                      value={formData.preferences.teamSize}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, teamSize: e.target.value } })}
                      className="input-field"
                    >
                      <option value="solo">Solo Work</option>
                      <option value="small">Small Team (2-5)</option>
                      <option value="medium">Medium Team (6-15)</option>
                      <option value="large">Large Team (16+)</option>
                      <option value="any">Any Size</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      checked={formData.preferences.remoteWork}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, remoteWork: e.target.checked } })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="remoteWork" className="text-sm font-medium">Open to Remote Work</label>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
