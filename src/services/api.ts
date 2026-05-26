import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1/', // URL local do seu Django
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição - Adiciona o token JWT no cabeçalho Authorization
api.interceptors.request.use(
  (config) => {
    // Pegamos o token onde foi salvo na página de Login
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
