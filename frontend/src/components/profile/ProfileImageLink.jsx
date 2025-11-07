import { Link } from 'react-router-dom';

export default function ProfileImageLink({ userId, profilePhoto, name, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (!userId) return null;

  return (
    <Link to={`/profile/${userId}`} className="flex-shrink-0">
      <img
        src={profilePhoto || '/default-avatar.png'}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover hover:ring-2 hover:ring-primary-500 transition-all`}
        title={name}
      />
    </Link>
  );
}
