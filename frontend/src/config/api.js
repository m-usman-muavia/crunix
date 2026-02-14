// Determine API base URL
// If REACT_APP_API_URL is set in environment, use it
// Otherwise, check if we're on localhost (development) or production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : ''); // Use relative paths in production

export default API_BASE_URL;
