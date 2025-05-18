
import axios from 'axios';
import { store } from '@/store';
import { logoutUser } from '@/store/authSlice';


const API_BASE_URL = 'https://websoft-exercise.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    
    let token = null;
    if (store) {
      const authState = store.getState().auth;
      if (authState) {
        token = authState.token;
      }
    }
    
    
    console.log('CLIENT-SIDE AXIOS INTERCEPTOR Request: Adding token if available. Token:', token ? 'Exists' : 'Missing', 'URL:', config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
    } else {
      
    }
    return config;
  },
  (error) => {
    console.error("CLIENT-SIDE AXIOS INTERCEPTOR Request Error:", error.config?.url, error.message, error.toJSON());
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    console.error('CLIENT-SIDE AXIOS INTERCEPTOR Response Error:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response && error.response.status === 401) {
      
      if (store) {
        console.log('CLIENT-SIDE AXIOS INTERCEPTOR (Response): 401 Error. Dispatching logoutUser.');
        store.dispatch(logoutUser());
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
