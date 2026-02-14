// Use REACT_APP_API_URL environment variable if set, otherwise use default
// In production (Heroku), use empty string for relative paths since backend and frontend are on same server
// In development, use localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? '' // Empty string makes API calls relative in production
    : 'http://localhost:5000');

export default API_BASE_URL;
