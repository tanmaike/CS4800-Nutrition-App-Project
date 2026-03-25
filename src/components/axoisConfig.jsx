import axios from 'axios';
import API_URL from "../config";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5001/api';

export default axios;