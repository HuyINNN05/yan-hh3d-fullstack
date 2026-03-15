/**
 * API Configuration
 * Tập trung quản lý API endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_API = `${API_URL}/api`;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${BASE_API}/login`,
  REGISTER: `${BASE_API}/register`,

  // Movies
  MOVIES: `${BASE_API}/movies`,
  MOVIE_DETAIL: (id) => `${BASE_API}/movies/${id}`,
  SEARCH_MOVIES: (q) => `${BASE_API}/search?q=${q}`,
  MOVIES_BY_CATEGORY: (id) => `${BASE_API}/movies/category/${id}`,

  // Episodes
  EPISODES: (movieId) => `${BASE_API}/episodes/${movieId}`,

  // Comments
  COMMENTS: (movieId) => `${BASE_API}/comments/${movieId}`,
  POST_COMMENT: `${BASE_API}/comments`,

  // Categories
  CATEGORIES: `${BASE_API}/categories`,

  // Admin - Movies
  ADMIN_MOVIES: `${BASE_API}/admin/movies`,
  ADMIN_MOVIE_UPDATE: (id) => `${BASE_API}/admin/movies/${id}`,
  ADMIN_MOVIE_DELETE: (id) => `${BASE_API}/admin/movies/${id}`,
  ADMIN_UPLOAD_IMAGE: `${BASE_API}/admin/upload-image`,

  // Admin - Episodes
  ADMIN_EPISODES: `${BASE_API}/admin/episodes`,
  ADMIN_EPISODE_DELETE: (id) => `${BASE_API}/admin/episodes/${id}`,

  // Admin - Users
  ADMIN_USERS: `${BASE_API}/admin/users`,
  ADMIN_USER_DELETE: (id) => `${BASE_API}/admin/users/${id}`,

  // Health
  HEALTH: `${BASE_API}/../health`,
};

export const API_URL_BASE = BASE_API;
export default API_ENDPOINTS;
