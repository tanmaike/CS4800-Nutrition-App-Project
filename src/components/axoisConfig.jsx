import axios from '../axiosConfig';
import API_URL from "../config";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;