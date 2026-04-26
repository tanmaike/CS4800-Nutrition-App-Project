import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`❌ Error ${error.response?.status}: ${error.response?.config?.url}`);
        return Promise.reject(error);
    }
);

export default axiosInstance;