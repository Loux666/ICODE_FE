import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      switch (error.response.status) {
        case 401:
          // Unauthorized - xóa token và redirect về login
          localStorage.removeItem('token');
          console.error('Unauthorized - Please login again');
          window.location.href = '/login'; 
          break;
        case 403:
          console.error('Forbidden - You do not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Error:', error.response.data?.message || error.message);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network error - Cannot connect to server');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const headerApi = {
  getHeader: () => apiClient.get('/header'),
};

export default apiClient;
