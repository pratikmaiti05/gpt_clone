import axios from 'axios'
const instance = axios.create({
  baseURL: "http://localhost:3000",  // Updated to match your backend port
  withCredentials: true,
})
export default instance
