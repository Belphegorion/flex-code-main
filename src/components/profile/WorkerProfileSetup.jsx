import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';
import LocationPicker from '../events/LocationPicker';
import AadhaarUpload from '../documents/AadhaarUpload';

export default function WorkerProfileSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    skills: [],
    bio: '',
    location: null,
    availability: 'flexible',
    hourlyRate: '',
    experience: '',
    portfolioLinks: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLink = () => {
    if (linkInput.trim()) {
      setFormData({ ...formData, portfolioLinks: [...formData.portfolioLinks, linkInput.trim()] });
      setLinkInput('');
    }
  };

  const removeLink = (index) => {
    setFormData({ ...formData, portfolioLinks: formData.portfolioLinks.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    if (!formData.location || !formData.location.address || typeof formData.location.lat !== 'number' || typeof formData.location.lng !== 'number') {
      toast.error('Please select a valid location with address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile-setup/worker', formData);
      onComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error completing profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Skills & Bio */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiBriefcase /> Your Skills *
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g., Event Setup, Audio/Visual, Catering"
                className="input-field flex-1"
              />
              <button onClick={addSkill} className="btn-primary">
                <FiPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                    <FiX size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself and your experience..."
              rows={4}
              maxLength={500}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
          </div>

          <button onClick={() => setStep(2)} className="btn-primary w-full">
            Next: Location & Availability
          </button>
        </div>
      )}

      {/* Step 2: Location & Availability */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiMapPin /> Your Location *
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3 text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                💡 Click "Auto-Detect" to automatically fill in your current location
              </p>
            </div>
            <LocationPicker
              value={formData.location}
              onChange={(location) => setFormData({ ...formData, location })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiClock /> Availability *
            </label>
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

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              Next: Rate & Portfolio
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Rate & Portfolio */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiDollarSign /> Hourly Rate (Optional)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              placeholder="25"
              min="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Years of Experience</label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 5 years"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Portfolio Links</label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder="https://..."
                className="input-field flex-1"
              />
              <button onClick={addLink} className="btn-primary">
                <FiPlus />
              </button>
            </div>
            <div className="space-y-2">
              {formData.portfolioLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-primary-600 dark:text-primary-400 truncate hover:underline">
                    {link}
                  </a>
                  <button onClick={() => removeLink(idx)} className="text-red-600 hover:text-red-700">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={() => setStep(4)} className="btn-primary flex-1">
              Next: Document Upload
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Document Upload */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your Aadhaar card for identity verification
            </p>
          </div>

          <AadhaarUpload onUploadComplete={() => {}} />

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Completing...' : 'Complete Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
