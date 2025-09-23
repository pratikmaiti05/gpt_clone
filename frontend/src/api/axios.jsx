import axios from 'axios'
const instance = axios.create({
  baseURL: "https://gpt-clone-backend-ljap.onrender.com", 
  withCredentials: true,
})
export default instance
