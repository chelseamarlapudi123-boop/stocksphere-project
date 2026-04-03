// Centralized API base URL — sourced from VITE_API_URL in .env
// Usage: import API from '../utils/api';
//        fetch(`${API}/api/your-endpoint`)
const API = import.meta.env.VITE_API_URL;

export default API;
