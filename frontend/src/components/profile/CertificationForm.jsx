import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';

const CertificationForm = ({ certification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuingOrganization: certification?.issuingOrganization || '',
    issueDate: certification?.issueDate ? new Date(certification.issueDate).toISOString().split('T')[0] : '',
    credentialId: certification?.credentialId || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (certification) {
        await api.put(`/profiles/certifications/${certification._id}`, formData);
        toast.success('Certification updated');
      } else {
        await api.post('/profiles/certifications', formData);
        toast.success('Certification added');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving certification');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        label="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        name="issuingOrganization"
        label="Issuing Organization"
        value={formData.issuingOrganization}
        onChange={handleChange}
        required
      />
      <Input
        type="date"
        name="issueDate"
        label="Issue Date"
        value={formData.issueDate}
        onChange={handleChange}
      />
      <Input
        name="credentialId"
        label="Credential ID"
        value={formData.credentialId}
        onChange={handleChange}
      />
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default CertificationForm;
