import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

const EducationForm = ({ education, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    school: education?.school || '',
    degree: education?.degree || '',
    fieldOfStudy: education?.fieldOfStudy || '',
    startDate: education?.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
    endDate: education?.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
    description: education?.description || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (education) {
        await api.put(`/profiles/education/${education._id}`, formData);
        toast.success('Education updated');
      } else {
        await api.post('/profiles/education', formData);
        toast.success('Education added');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving education');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="school"
        label="School"
        value={formData.school}
        onChange={handleChange}
        required
      />
      <Input
        name="degree"
        label="Degree"
        value={formData.degree}
        onChange={handleChange}
      />
      <Input
        name="fieldOfStudy"
        label="Field of Study"
        value={formData.fieldOfStudy}
        onChange={handleChange}
      />
      <Input
        type="date"
        name="startDate"
        label="Start Date"
        value={formData.startDate}
        onChange={handleChange}
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

export default EducationForm;
