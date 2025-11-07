const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

export const saveSearch = (query) => {
  if (!query || !query.trim()) return;
  
  const history = getSearchHistory();
  const filtered = history.filter(item => item !== query.trim());
  const updated = [query.trim(), ...filtered].slice(0, MAX_HISTORY);
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const clearSearchHistory = () => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

export const removeSearchItem = (query) => {
  const history = getSearchHistory();
  const updated = history.filter(item => item !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};
