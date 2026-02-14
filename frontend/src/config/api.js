// Use REACT_APP_API_URL environment variable if set, otherwise use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? window.location.origin // Use same origin in production if backend is on same server
    : 'http://localhost:5000');

export default API_BASE_URL;
