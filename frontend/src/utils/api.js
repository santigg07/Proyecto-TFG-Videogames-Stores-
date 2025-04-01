import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

export const getGames = async () => {
  try {
    const response = await api.get('/games');
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    return { data: [] };
  }
};

export default api;