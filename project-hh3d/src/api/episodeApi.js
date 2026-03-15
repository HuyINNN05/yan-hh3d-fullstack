import axiosInstance from './axiosInstance';

export const fetchAdminEpisodesByMovie = (movieId) =>
  axiosInstance.get(`/admin/episodes/${movieId}`);

export const createAdminEpisode = (payload) =>
  axiosInstance.post('/admin/episodes', payload);
