const ProfileCompleteness = ({ profile }) => {
  const calculateCompleteness = () => {
    let score = 0;
    const totalFields = 6; // bio, skills, workExperience, education, portfolio, certifications

    if (profile?.bio) score++;
    if (profile?.skills?.length > 0) score++;
    if (profile?.workExperience?.length > 0) score++;
    if (profile?.education?.length > 0) score++;
    if (profile?.portfolio?.length > 0) score++;
    if (profile?.certifications?.length > 0) score++;

    return Math.round((score / totalFields) * 100);
  };

  const percentage = calculateCompleteness();

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-2">Profile Completeness</h3>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">{percentage}%</p>
    </div>
  );
};

export default ProfileCompleteness;
