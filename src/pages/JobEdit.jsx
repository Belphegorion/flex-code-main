import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiX } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';

export default function JobEdit() {
  const { eventId, jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    payPerPerson: '',
    totalPositions: '',
    requiredSkills: [],
    skillInput: ''
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      const job = res.job || res;
      setFormData({
        title: job.title,
        description: job.description,
        payPerPerson: job.payPerPerson,
        totalPositions: job.totalPositions,
        requiredSkills: job.requiredSkills || [],
        skillInput: ''
      });
    } catch (error) {
      toast.error('Failed to load job');
      navigate(`/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (formData.skillInput.trim() && !formData.requiredSkills.includes(formData.skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, formData.skillInput.trim()],
        skillInput: ''
      });
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        payPerPerson: parseFloat(formData.payPerPerson),
        totalPositions: parseInt(formData.totalPositions),
        requiredSkills: formData.requiredSkills,
        roles: formData.requiredSkills
      };

      await api.put(`/events/${eventId}/jobs/${jobId}`, updateData);
      toast.success('Job updated successfully!');
      navigate(`/events/${eventId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Edit Job</h1>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pay per Person ($) *</label>
                <input
                  type="number"
                  value={formData.payPerPerson}
                  onChange={(e) => setFormData({ ...formData, payPerPerson: e.target.value })}
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Positions *</label>
                <input
                  type="number"
                  value={formData.totalPositions}
                  onChange={(e) => setFormData({ ...formData, totalPositions: e.target.value })}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Required Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.skillInput}
                  onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter"
                  className="input-field flex-1"
                />
                <button type="button" onClick={addSkill} className="btn-secondary px-4">
                  Add
                </button>
              </div>
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600">
                        <FiX size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <FiSave />
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
        </motion.div>
      </div>
    </Layout>
  );
}