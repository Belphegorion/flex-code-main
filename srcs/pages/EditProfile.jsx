import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import WorkExperienceForm from '../components/profile/WorkExperienceForm';
import EducationForm from '../components/profile/EducationForm';
import PortfolioForm from '../components/profile/PortfolioForm';
import CertificationForm from '../components/profile/CertificationForm';
import Button from '../components/common/Button';
import { FiPlus } from 'react-icons/fi';

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles/my-profile');
      setProfile(res.data.profile);
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setModalContent(null);
    fetchProfile();
  };

  const openModal = (type, data = null) => {
    let title = '';
    let content = null;
    switch (type) {
      case 'workExperience':
        title = data ? 'Edit Work Experience' : 'Add Work Experience';
        content = <WorkExperienceForm experience={data} onSave={handleSave} onCancel={() => setModalContent(null)} />;
        break;
      case 'education':
        title = data ? 'Edit Education' : 'Add Education';
        content = <EducationForm education={data} onSave={handleSave} onCancel={() => setModalContent(null)} />;
        break;
      case 'portfolio':
        title = data ? 'Edit Portfolio Item' : 'Add Portfolio Item';
        content = <PortfolioForm item={data} onSave={handleSave} onCancel={() => setModalContent(null)} />;
        break;
      case 'certification':
        title = data ? 'Edit Certification' : 'Add Certification';
        content = <CertificationForm certification={data} onSave={handleSave} onCancel={() => setModalContent(null)} />;
        break;
      default:
        return;
    }
    setModalContent({ title, content });
  };

  if (loading) {
    return <Layout><div className="text-center p-8">Loading...</div></Layout>;
  }

  if (!profile) {
    return <Layout><div className="text-center p-8">Could not load profile.</div></Layout>;
  }

  const Section = ({ title, children, onAdd }) => (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button onClick={onAdd} icon={FiPlus} size="sm">Add</Button>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <Section title="Work Experience" onAdd={() => openModal('workExperience')}>
          {profile.workExperience.map(item => (
            <div key={item._id} onClick={() => openModal('workExperience', item)} className="cursor-pointer p-4 my-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">{item.title} at {item.company}</h3>
            </div>
          ))}
        </Section>

        <Section title="Education" onAdd={() => openModal('education')}>
          {profile.education.map(item => (
            <div key={item._id} onClick={() => openModal('education', item)} className="cursor-pointer p-4 my-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">{item.school}</h3>
            </div>
          ))}
        </Section>

        <Section title="Portfolio" onAdd={() => openModal('portfolio')}>
          {profile.portfolio.map(item => (
            <div key={item._id} onClick={() => openModal('portfolio', item)} className="cursor-pointer p-4 my-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">{item.title}</h3>
            </div>
          ))}
        </Section>

        <Section title="Certifications" onAdd={() => openModal('certification')}>
          {profile.certifications.map(item => (
            <div key={item._id} onClick={() => openModal('certification', item)} className="cursor-pointer p-4 my-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">{item.name}</h3>
            </div>
          ))}
        </Section>

        <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent?.title}>
          {modalContent?.content}
        </Modal>
      </div>
    </Layout>
  );
};

export default EditProfile;
