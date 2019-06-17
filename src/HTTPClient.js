import axios from 'axios'

const HTTP = axios.create({
    baseURL: "http://192.168.0.11:" + getPort(),
});

function getPort() {
    return "8000"
}

export default HTTP