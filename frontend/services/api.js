import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  // baseURL: "https://authentication-system-1t1m.onrender.com/api", // change to your backend
  withCredentials: true,
});

export default API;
