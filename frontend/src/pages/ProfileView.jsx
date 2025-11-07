import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import { FiStar, FiMapPin, FiEdit } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

// --- Placeholder components for the new sections ---
const WorkExperienceSection = ({ experience }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Work Experience</h2>
    {experience.map(item => (
      <div key={item._id} className="mb-4">
        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="text-md text-gray-600 dark:text-gray-400">{item.company}</p>
        <p className="text-sm text-gray-500">{new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Present'}</p>
        <p className="mt-2">{item.description}</p>
      </div>
    ))}
  </div>
);

const EducationSection = ({ education }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Education</h2>
    {education.map(item => (
      <div key={item._id} className="mb-4">
        <h3 className="text-xl font-semibold">{item.school}</h3>
        <p className="text-md text-gray-600 dark:text-gray-400">{item.degree}, {item.fieldOfStudy}</p>
      </div>
    ))}
  </div>
);

const PortfolioSection = ({ portfolio }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Portfolio</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolio.map(item => (
        <div key={item._id} className="card">
          <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover"/>
          <div className="p-4">
            <h3 className="font-semibold">{item.title}</h3>
            <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">View Project</a>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CertificationsSection = ({ certifications }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Certifications</h2>
    {certifications.map(item => (
      <div key={item._id} className="mb-2">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{item.issuingOrganization}</p>
      </div>
    ))}
  </div>
);

const ProfileView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/profiles/${id}`);
      setProfile(res.profile || res);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
          </div>
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
          className="card p-8"
        >
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
              {profile.userId?.profilePhoto ? (
                <img src={profile.userId.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.userId?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold">{profile.userId?.name || 'User'}</h1>
                {isOwnProfile && (
                  <Link to="/profile/edit" className="btn-primary flex items-center gap-2">
                    <FiEdit /> Edit Profile
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                {profile.location?.city && (
                  <div className="flex items-center gap-1">
                    <FiMapPin size={16} />
                    <span>{profile.location.city}</span>
                  </div>
                )}
                {profile.userId?.ratingAvg > 0 && (
                  <div className="flex items-center gap-1">
                    <FiStar size={16} className="text-yellow-400" />
                    <span>{profile.userId.ratingAvg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">About</h2>
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}

          {profile.workExperience?.length > 0 && <WorkExperienceSection experience={profile.workExperience} />}
          {profile.education?.length > 0 && <EducationSection education={profile.education} />}
          {profile.portfolio?.length > 0 && <PortfolioSection portfolio={profile.portfolio} />}
          {profile.certifications?.length > 0 && <CertificationsSection certifications={profile.certifications} />}

        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfileView;
