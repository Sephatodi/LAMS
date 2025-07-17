import { useAuth } from '../context/AuthContext';

const useApi = () => {
  const { user } = useAuth();

  const request = async (url, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (err) {
      console.error('API request error:', err);
      throw err;
    }
  };

  const get = (url) => request(url, { method: 'GET' });
  const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) });
  const put = (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) });
  const del = (url) => request(url, { method: 'DELETE' });

  return { get, post, put, delete: del };
};

export default useApi;