import axios from 'axios'

const HTTP = axios.create({
    baseURL: "http://localhost:8000",
});

export default HTTP