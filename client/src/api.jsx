import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // backend Express chạy port 5000
});

export default API;
