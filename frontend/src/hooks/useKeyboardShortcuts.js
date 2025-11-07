import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = (user) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input/textarea or contenteditable
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

      // Ctrl/Cmd + K: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (user?.role === 'worker') navigate('/jobs');
      }

      // Ctrl/Cmd + H: Home/Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        navigate(user?.role ? `/${user.role}` : '/');
      }

      // Ctrl/Cmd + Shift + P: Profile (avoid conflict with print)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        navigate('/profile/edit');
      }

      // Ctrl/Cmd + G: Groups
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        navigate('/groups');
      }

      // Escape: Go back
      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, user]);
};
