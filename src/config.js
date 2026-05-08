/**
 * Central configuration for the API URL.
 * It uses the VITE_API_URL environment variable if available (for production),
 * otherwise it falls back to localhost:5000 (for local development).
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_URL;
