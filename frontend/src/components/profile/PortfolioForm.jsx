import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

const PortfolioForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    projectUrl: item?.projectUrl || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item) {
        await api.put(`/profiles/portfolio/${item._id}`, formData);
        toast.success('Portfolio item updated');
      } else {
        await api.post('/profiles/portfolio', formData);
        toast.success('Portfolio item added');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving portfolio item');
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
      <Textarea
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <Input
        name="imageUrl"
        label="Image URL"
        value={formData.imageUrl}
        onChange={handleChange}
      />
      <Input
        name="projectUrl"
        label="Project URL"
        value={formData.projectUrl}
        onChange={handleChange}
      />
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default PortfolioForm;
