import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
    withCredentials: true, // This sends cookies with every request
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;
