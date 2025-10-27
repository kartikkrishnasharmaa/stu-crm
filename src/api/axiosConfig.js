import axios from 'axios';
const instance = axios.create({
  baseURL: 'https://crmtesting.sinfode.com/api/',
  // baseURL: 'https://crmm.sinfode.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
