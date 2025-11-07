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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8"
        >
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center text-xl font-semibold overflow-hidden flex-shrink-0">
              {profile.userId?.profilePhoto ? (
                <img src={profile.userId.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.userId?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.userId?.name || 'User'}</h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {profile.location?.city && (
                      <div className="flex items-center gap-1">
                        <FiMapPin size={12} />
                        <span>{profile.location.city}</span>
                      </div>
                    )}
                    {profile.userId?.ratingAvg > 0 && (
                      <div className="flex items-center gap-1">
                        <FiStar size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{profile.userId.ratingAvg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Link to="/profile/edit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                    <FiEdit size={14} /> Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {profile.tagline && (
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 italic">"{profile.tagline}"</p>
            </div>
          )}

          {profile.bio && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">About</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Professional Info */}
          {(profile.yearsOfExperience || profile.hourlyRate || profile.availability) && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.yearsOfExperience && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.yearsOfExperience} years</p>
                </div>
              )}
              {profile.hourlyRate && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${profile.hourlyRate}/hr</p>
                </div>
              )}
              {profile.availability && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{profile.availability}</p>
                </div>
              )}
              {profile.userId?.completedJobsCount > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jobs Completed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.userId.completedJobsCount}</p>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.languages?.length > 0 && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Languages</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.languages.map((lang, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium">{lang.language}</span>
                    <span className="text-xs text-gray-500 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors">
                    GitHub
                  </a>
                )}
                {profile.socialLinks.portfolio && (
                  <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                    Portfolio
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Work Preferences */}
          {profile.preferences && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Work Preferences</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {profile.preferences.travelWillingness && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Travel</p>
                    <p className="font-medium capitalize">{profile.preferences.travelWillingness}</p>
                  </div>
                )}
                {profile.preferences.teamSize && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Team Size</p>
                    <p className="font-medium capitalize">{profile.preferences.teamSize}</p>
                  </div>
                )}
                {profile.preferences.remoteWork !== undefined && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Remote Work</p>
                    <p className="font-medium">{profile.preferences.remoteWork ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {profile.workExperience?.length > 0 && (
              <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <WorkExperienceSection experience={profile.workExperience} />
              </div>
            )}
            {profile.education?.length > 0 && (
              <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <EducationSection education={profile.education} />
              </div>
            )}
          </div>

          {profile.portfolio?.length > 0 && (
            <div className="mt-5 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <PortfolioSection portfolio={profile.portfolio} />
            </div>
          )}
          {profile.certifications?.length > 0 && (
            <div className="mt-5 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <CertificationsSection certifications={profile.certifications} />
            </div>
          )}

        </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileView;
