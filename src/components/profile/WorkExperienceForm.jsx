import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

const WorkExperienceForm = ({ experience, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company: experience?.company || '',
    location: experience?.location || '',
    startDate: experience?.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
    endDate: experience?.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
    description: experience?.description || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (experience) {
        await api.put(`/profiles/work-experience/${experience._id}`, formData);
        toast.success('Work experience updated');
      } else {
        await api.post('/profiles/work-experience', formData);
        toast.success('Work experience added');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving work experience');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <Input
        name="company"
        label="Company"
        value={formData.company}
        onChange={handleChange}
        required
      />
      <Input
        name="location"
        label="Location"
        value={formData.location}
        onChange={handleChange}
      />
      <Input
        type="date"
        name="startDate"
        label="Start Date"
        value={formData.startDate}
        onChange={handleChange}
        required
      />
      <Input
        type="date"
        name="endDate"
        label="End Date"
        value={formData.endDate}
        onChange={handleChange}
      />
      <Textarea
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default WorkExperienceForm;
